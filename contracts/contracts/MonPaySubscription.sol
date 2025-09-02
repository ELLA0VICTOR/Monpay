// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";



/**
 * @title MonPaySubscription
 * @notice Subscriptions, content gating and revenue for Monad Testnet.
 * - Gasless via MonPayRelayer (ERC-2771 style): calls include (user, relayer) tail data
 * - Optional subscribeWithPermit(WMON) to set allowance and pull in one call if token supports EIP-2612
 * - chargeRenewal() callable by anyone when autoRenew=true and allowance sufficient
 */
contract MonPaySubscription {
    // ====== ERC2771-like context ======
    address public immutable forwarder;

    modifier onlyForwarder() {
        require(msg.sender == forwarder, "not forwarder");
        _;
    }

    constructor(address _wmon, address _forwarder) {
        require(_wmon != address(0) && _forwarder != address(0), "bad addr");
        WMON = IERC20(_wmon);
        forwarder = _forwarder;
    }

    function _msgSender() internal view returns (address sender) {
        if (msg.sender == forwarder) {
            // read last 40 bytes of calldata: 20 for original sender, 20 for relayer
            assembly {
                let size := calldatasize()
                sender := shr(96, calldataload(sub(size, 40)))
            }
        } else {
            sender = msg.sender;
        }
    }

    // ====== Storage ======
    IERC20 public immutable WMON;

    struct Plan {
        uint256 id;
        address creator;
        uint256 price; // price per period in WMON (wei)
        uint256 period; // seconds, e.g., 30 days
        string name;
        string description;
        bool active;
    }

    struct Subscription {
        uint256 planId;
        address subscriber;
        uint256 expiresAt;
        bool autoRenew;
    }

    struct Content {
        uint256 id;
        address creator;
        string uri;      // IPFS/Arweave URL/Hash
        string title;
        uint256 createdAt;
        bool active;
    }

    uint256 public nextPlanId = 1;
    uint256 public nextContentId = 1;

    mapping(uint256 => Plan) public plans;                     // planId => Plan
    mapping(address => uint256[]) public creatorPlans;         // creator => planIds
    mapping(address => uint256[]) public creatorContents;      // creator => contentIds

    // subscriber => planId => Subscription
    mapping(address => mapping(uint256 => Subscription)) public subscriptions;

    // ====== Events ======
    event PlanCreated(uint256 indexed planId, address indexed creator, uint256 price, uint256 period, string name);
    event PlanUpdated(uint256 indexed planId, uint256 price, string name, string description, bool active);
    event ContentUploaded(uint256 indexed contentId, address indexed creator, string uri, string title);
    event ContentToggled(uint256 indexed contentId, bool active);
    event Subscribed(address indexed subscriber, uint256 indexed planId, uint256 months, uint256 expiresAt, bool autoRenew);
    event Renewed(address indexed subscriber, uint256 indexed planId, uint256 months, uint256 newExpiry);
    event Cancelled(address indexed subscriber, uint256 indexed planId);
    event RevenueWithdrawn(address indexed creator, uint256 amount);

    // ====== Modifiers ======
    modifier onlyCreator(uint256 planId) {
        require(plans[planId].creator == _msgSender(), "not creator");
        _;
    }

    // ====== Creator & Plans ======
    function createPlan(
        uint256 price,
        uint256 periodSeconds,
        string calldata name,
        string calldata description
    ) external returns (uint256 planId) {
        require(price > 0, "price=0");
        require(periodSeconds >= 1 days, "period too small");

        planId = nextPlanId++;
        plans[planId] = Plan({
            id: planId,
            creator: _msgSender(),
            price: price,
            period: periodSeconds,
            name: name,
            description: description,
            active: true
        });
        creatorPlans[_msgSender()].push(planId);
        emit PlanCreated(planId, _msgSender(), price, periodSeconds, name);
    }

    function updatePlan(
        uint256 planId,
        uint256 price,
        string calldata name,
        string calldata description,
        bool active
    ) external onlyCreator(planId) {
        Plan storage p = plans[planId];
        p.price = price;
        p.name = name;
        p.description = description;
        p.active = active;
        emit PlanUpdated(planId, price, name, description, active);
    }

    // ====== Content ======
    function uploadContent(string calldata uri, string calldata title) external returns (uint256 contentId) {
        require(bytes(uri).length > 0, "uri required");
        contentId = nextContentId++;
        creatorContents[_msgSender()].push(contentId);
        _contents[contentId] = Content({
            id: contentId,
            creator: _msgSender(),
            uri: uri,
            title: title,
            createdAt: block.timestamp,
            active: true
        });
        emit ContentUploaded(contentId, _msgSender(), uri, title);
    }

    mapping(uint256 => Content) private _contents;
    function getContent(uint256 contentId) external view returns (Content memory) {
        return _contents[contentId];
    }

    function toggleContent(uint256 contentId, bool active) external {
        Content storage c = _contents[contentId];
        require(c.creator == _msgSender(), "not owner");
        c.active = active;
        emit ContentToggled(contentId, active);
    }

    // ====== Subscriptions ======
    function isSubscriber(address creator, address user) public view returns (bool) {
        // user is subscriber if they have any active sub to any plan by creator that hasn't expired
        uint256[] memory planIds = creatorPlans[creator];
        for (uint256 i = 0; i < planIds.length; i++) {
            Subscription memory s = subscriptions[user][planIds[i]];
            if (s.expiresAt >= block.timestamp) return true;
        }
        return false;
    }

    function subscribe(uint256 planId, uint256 months, bool autoRenew_) public {
        require(months >= 1, "months>=1");
        Plan memory p = plans[planId];
        require(p.active, "inactive plan");
        uint256 amount = p.price * months;

        // pull WMON
        require(WMON.transferFrom(_msgSender(), p.creator, amount), "transferFrom failed");

        // set/extend subscription
        Subscription storage sub = subscriptions[_msgSender()][planId];
        uint256 base = sub.expiresAt > block.timestamp ? sub.expiresAt : block.timestamp;
        sub.planId = planId;
        sub.subscriber = _msgSender();
        sub.expiresAt = base + p.period * months;
        sub.autoRenew = autoRenew_;

        emit Subscribed(_msgSender(), planId, months, sub.expiresAt, autoRenew_);
    }

    /// @notice One-call subscribe using EIP-2612 permit if WMON supports it.
    function subscribeWithPermit(
        uint256 planId,
        uint256 months,
        bool autoRenew_,
        uint256 value,     // allowance to set for this contract or creator? We set spender = creator
        uint256 deadline,
        uint8 v, bytes32 r, bytes32 s
    ) external {
        Plan memory p = plans[planId];
        require(p.active, "inactive plan");
        // permit spender = plan creator, so future renewals can pull without new signature
        IERC20Permit(address(WMON)).permit(_msgSender(), p.creator, value, deadline, v, r, s);
        subscribe(planId, months, autoRenew_);
    }

    /// @notice Anyone can trigger renewal if subscriber opted-in and has allowance to creator.
    function chargeRenewal(address subscriber, uint256 planId, uint256 months) external {
        require(months >= 1, "months>=1");
        Plan memory p = plans[planId];
        Subscription storage sub = subscriptions[subscriber][planId];
        require(sub.autoRenew, "autoRenew off");
        require(sub.expiresAt <= block.timestamp, "not yet expired");

        uint256 amount = p.price * months;

        // pull WMON from subscriber to creator (requires allowance to creator)
        require(WMON.transferFrom(subscriber, p.creator, amount), "transferFrom failed");

        uint256 base = block.timestamp;
        sub.expiresAt = base + p.period * months;

        emit Renewed(subscriber, planId, months, sub.expiresAt);
    }

    function cancel(uint256 planId) external {
        Subscription storage sub = subscriptions[_msgSender()][planId];
        require(sub.planId == planId, "no sub");
        sub.autoRenew = false;
        emit Cancelled(_msgSender(), planId);
    }

    // ====== View helpers ======
    function getCreatorPlans(address creator) external view returns (Plan[] memory arr) {
        uint256[] memory ids = creatorPlans[creator];
        arr = new Plan[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) arr[i] = plans[ids[i]];
    }

    function getCreatorContents(address creator) external view returns (Content[] memory arr) {
        uint256[] memory ids = creatorContents[creator];
        arr = new Content[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) arr[i] = _contents[ids[i]];
    }
}
