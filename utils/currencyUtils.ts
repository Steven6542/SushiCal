/**
 * 货币转换相关工具函数
 */

export type CurrencySymbol = '¥' | 'HK$' | 'NT$';

/**
 * 汇率定义（以港币 HKD 为基准）
 */
interface ExchangeRates {
    toHKD: Record<CurrencySymbol, number>;
    fromHKD: Record<CurrencySymbol, number>;
}

/**
 * 汇率配置
 * 基准货币: HKD (1 HKD = 1)
 */
export const EXCHANGE_RATES: ExchangeRates = {
    // 转换到港币的汇率
    toHKD: {
        'HK$': 1,
        'NT$': 0.25,    // 1 TWD ≈ 0.25 HKD
        '¥': 1.08,      // 1 CNY ≈ 1.08 HKD
    },
    // 从港币转换的汇率
    fromHKD: {
        'HK$': 1,
        'NT$': 4.0,     // 1 HKD ≈ 4 TWD
        '¥': 0.92,      // 1 HKD ≈ 0.92 CNY
    }
};

/**
 * 支持的货币列表
 */
export const SUPPORTED_CURRENCIES: CurrencySymbol[] = ['¥', 'HK$', 'NT$'];

/**
 * 将金额从一种货币转换为另一种货币
 * @param amount 金额
 * @param fromCurrency 源货币
 * @param toCurrency 目标货币
 */
export const convertCurrency = (
    amount: number,
    fromCurrency: CurrencySymbol,
    toCurrency: CurrencySymbol
): number => {
    if (fromCurrency === toCurrency) return amount;

    // 先转换为 HKD
    const amountInHKD = amount * EXCHANGE_RATES.toHKD[fromCurrency];

    // 再转换为目标货币
    return amountInHKD * EXCHANGE_RATES.fromHKD[toCurrency];
};

/**
 * 计算总金额（支持多币种）
 * @param amounts 金额数组，每个元素包含金额和货币符号
 * @param targetCurrency 目标货币（用于统一计算）
 */
export const calculateTotalInCurrency = (
    amounts: Array<{ amount: number; currency: CurrencySymbol }>,
    targetCurrency: CurrencySymbol
): number => {
    return amounts.reduce((total, item) => {
        return total + convertCurrency(item.amount, item.currency, targetCurrency);
    }, 0);
};
