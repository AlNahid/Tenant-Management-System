export const validCharge = (v) => String(v).trim() !== '' && Number.isFinite(+v) && +v >= 0;
export const total = (...a) => Math.round(a.reduce((s, x) => s + Number(x || 0), 0) * 100) / 100;
