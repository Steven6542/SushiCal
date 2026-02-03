/**
 * 价格计算相关工具函数
 */

/**
 * 根据地区获取价格
 * @param basePrice 基础价格
 * @param regionalPrices 地区价格映射
 * @param region 地区代码
 * @returns 最终价格（如果有地区价格则返回地区价格，否则返回基础价格）
 */
export const getPriceByRegion = (
    basePrice: number,
    regionalPrices?: Record<string, number>,
    region?: string
): number => {
    if (!regionalPrices || !region) return basePrice;
    return regionalPrices[region] ?? basePrice;
};

/**
 * 计算服务费
 * @param subtotal 小计金额
 * @param serviceChargeType 服务费类型
 * @param serviceChargeValue 服务费值
 * @param headCount 人数（仅在按人头收费时使用）
 */
export const calculateServiceCharge = (
    subtotal: number,
    serviceChargeType: 'percent' | 'head' | 'none',
    serviceChargeValue: number,
    headCount: number = 1
): number => {
    switch (serviceChargeType) {
        case 'percent':
            return subtotal * (serviceChargeValue / 100);
        case 'head':
            return serviceChargeValue * headCount;
        case 'none':
        default:
            return 0;
    }
};

/**
 * 格式化价格显示
 * @param price 价格
 * @param currencySymbol 货币符号
 * @param decimals 小数位数，默认2位
 */
export const formatPrice = (
    price: number,
    currencySymbol: string,
    decimals: number = 2
): string => {
    return `${currencySymbol}${price.toFixed(decimals)}`;
};

/**
 * 计算折扣后价格
 * @param originalPrice 原价
 * @param discountPercent 折扣百分比（例如：10 表示 10% off）
 */
export const calculateDiscountedPrice = (
    originalPrice: number,
    discountPercent: number
): number => {
    return originalPrice * (1 - discountPercent / 100);
};
