import { Region } from '../types';

/**
 * 地区相关工具函数
 */

/**
 * 获取地区对应的货币符号
 */
export const getCurrencySymbol = (region: Region): string => {
    switch (region) {
        case 'mainland': return '¥';
        case 'taiwan': return 'NT$';
        case 'hk':
        default: return 'HK$';
    }
};

/**
 * 地区名称映射（用于翻译）
 */
export const regionTranslationKeys: Record<Region, string> = {
    mainland: 'home.mainland',
    hk: 'home.hk',
    taiwan: 'home.taiwan'
};

/**
 * 获取地区显示名称
 * @param region 地区代码
 * @param t 翻译函数
 */
export const getRegionName = (region: Region, t: (key: string) => string): string => {
    return t(regionTranslationKeys[region]);
};

/**
 * 所有支持的地区列表
 */
export const ALL_REGIONS: Region[] = ['mainland', 'hk', 'taiwan'];
