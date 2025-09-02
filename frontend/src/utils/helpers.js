export function shortAddress(addr) {
    return addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : '';
  }
  
  export function toWei(n) {
    return BigInt(Math.floor(Number(n) * 1e6)) * (10n ** 12n); // naive helper for UI only
  }
  
  export function fromWei(bi) {
    return Number(bi) / 1e18;
  }
  