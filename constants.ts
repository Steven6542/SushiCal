import { Brand, MealRecord, Region } from './types';

export const GET_CURRENCY = (region: Region) => {
    switch (region) {
        case 'mainland': return '¥';
        case 'macau': return 'MOP$';
        case 'hk': default: return 'HK$';
    }
};

export const MOCK_BRANDS: Brand[] = [
  {
    id: 'sushiro',
    name: '寿司郎',
    description: '日本人气No.1回转寿司',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJZkgYhNbeMOlKFLuORNl8E--9q6Yq04GXfglrc6Vp4V3nrRFh7dA_sC64SwnIzZR5dEBnS6c2ulA63moB95MIzNCi6O_pt_YrfpAVYvMQMzpSLi4z8ofQ-6aReLF1O6G7mjxK2FpmWCiWoHQL6K7QFf6VIAwDkU6_INmTNezFyjsa7KsNgt-LgLhSJHGvTBn-aNEATl3sVVmllqMiqNbHGjOiUynibRMlnbXoGhqSVOMi3pQYHLPX8uZTrCshVbdySoYhO8xw3Cs',
    tags: ['hot'],
    defaultServiceCharge: { type: 'percent', value: 10 },
    plates: [
      { id: 'p1', name: '红碟', color: '#EF4444', price: 12 },
      { id: 'p2', name: '银碟', color: '#D1D5DB', price: 17 },
      { id: 'p3', name: '金碟', color: '#EAB308', price: 22 },
      { id: 'p4', name: '黑碟', color: '#111827', price: 27 },
    ],
    sideDishes: [
      { id: 's1', name: '拉面 / 乌冬', price: 32, icon: 'ramen_dining' },
      { id: 's2', name: '天妇罗 / 炸物', price: 27, icon: 'tapas' },
      { id: 's3', name: '饮料 / 酒类', price: 18, icon: 'local_bar' },
    ]
  },
  {
    id: 'kura',
    name: '藏寿司',
    description: '坚持100%无添加',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvdLQ2EcKEAvO4fgr-8i0hJZUWqod4xdPNVvmnFCpg8eQWCESVnYiyeJInP5gnbDEKO3VzkYPLUUD_muW-Xm4qQNvURbtAte1iVTueajFygrKCLIrjps4D2u5bUvWGPMhRh6zrAIyfi73K4T_8dzAxF6wrUGdPo0AYQUbXsWdRS_0K3iy89xiEm2LUipqNAZlGYMytDkX2o6g0sQH0jkpkkDwa_YbdmlfgA21SsXR0DYossTm4DfLcEbIREvrWOleFDmat1cnF0rI',
    tags: ['new'],
    defaultServiceCharge: { type: 'percent', value: 10 },
    plates: [
      { id: 'k1', name: '普通碟', color: '#3B82F6', price: 12 }, // Example blue
      { id: 'k2', name: '特殊碟', color: '#EF4444', price: 24 },
    ],
    sideDishes: [
       { id: 's1', name: '味噌汤', price: 18, icon: 'soup_kitchen' },
    ]
  },
  {
    id: 'genki',
    name: '元气寿司',
    description: '大众喜爱的经典选择',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJd9j8NBLCeiehzQqhNK7fUPtI8pfM4EKf_zlvQdSa2haz2hb1MhZGC0wvtHzBtCx7xLRz9F1mcVEaTAR3K-zg8i0QH0cZ0bep74lnWLTlHZsI5iOyYYpZChd9PU6T784Y1rGmPqKPiwqa5zlAbkvm73dYJGaEOHdIpzOFBCVMmj0sgC5zURNn2ClZXcWdz7Fy7uBQSufl_SoDFblfzHYJ5Zjb8_34WebJQQLV7AVhVPlkhXDznT9v_RXxZYfW08SWKlgQQtN_3z4',
    defaultServiceCharge: { type: 'percent', value: 10 },
    plates: [
      { id: 'g1', name: '绿碟', color: '#22C55E', price: 10 },
      { id: 'g2', name: '红碟', color: '#EF4444', price: 14 },
    ],
    sideDishes: []
  },
    {
    id: 'sushi_express',
    name: '争鲜',
    description: '高性价比的美味',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVjS2grA8SyqmGJly4ZqAzisbCMqWgh4Lijjk945fmz8Dk0ua89sCow1uMINTVFMzQuI6KisFqnGeNeydoOtckezMTltcvTwFZKCfsU1I163IgtW_5Wbgq8GWygQyk7_mEkSNzdH24VO6v3xVYjKrtB9Yi0im357-tmSvKs_Kl1swsdyaoKJf15svmkSTyApD5HKXqJe8Aa7gr_4SLo7lgSunY1YpM3ta8RiBSjSVPFbf_DYdWqUruyFoizPTop7-ExfpXReUGLk',
    defaultServiceCharge: { type: 'none', value: 0 },
    plates: [
      { id: 'se1', name: '粉碟', color: '#F472B6', price: 6 },
    ],
    sideDishes: []
  },
  {
    id: 'hama',
    name: '滨寿司',
    description: '适合家庭聚餐',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2fUg53B0wJA_EOB-Io4fY4jX-_AUFUXvRVA5cOCyr0nF5P7P6sh7ZKqw0Vw2SQITx2Sbk5yWTGIyHrJK349NsePMfwcvT6pX4Z1Qzy4V2V4wV3TlsU6CzubRzd0BE8CLIClwrpD4JF7T2JTLnDzCTnmrYrTh7gKrpLc__d19uyHjikWaM5nBWwUoNzD6btiHxUZSm00OW7uXCtPG0R_dWXvWC7ZvUZ0ocxewlFh4RpAV2GsIOim8L0eYRby6vSnwyfQNCskZ3HV0',
    defaultServiceCharge: { type: 'percent', value: 10 },
    plates: [{ id: 'h1', name: '标准', color: '#3B82F6', price: 10 }],
    sideDishes: []
  },
  {
    id: 'itamae',
    name: '板前寿司',
    description: '职人手作精选',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADSNxrW04V5iFbafCzFDaWDRkZd758FJuI2VXqqHq-2utOL-VWlS_DUvkw2Am9Qr2Lg_4BgczdLWb092zoj6_g4sgy8LeJL1K2FR_O4C2T5bJTL2U0Mgunshi0N62QDBWOphS1CUQMs4GDrGpcxz6G0yh3Cab-5EA-9AtU6si0MQHPIVqXoqUQELJTZ6HsVFKBejpcve8okj8c_N9EaPvY1cURk4KPEPU4wEowgeOx4NDTm7p6KEfO9iRnDH-QWgMt6K7MlODhNQU',
    defaultServiceCharge: { type: 'percent', value: 10 },
    plates: [{ id: 'i1', name: '黑金', color: '#000000', price: 35 }],
    sideDishes: []
  }
];

export const MOCK_HISTORY: MealRecord[] = [
  {
    id: 'h1',
    brandName: '寿司大',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvzB43CCXiJ01CRXvnkxxSkVfAAW1n-o7n9sowk5FRJ_0n8U_EC-X3EKl7N-dsSetqwvZ8ef0AjJkHaymfvawkYFacuu-Lw3pYNkEzeKpXIzwK4kj0hAMCOwH8TMvKYtfDZ1ByeF78PCtqYvuWYQzTVVZKfSpOGK9Zo6gSq8tIgM34MBk36Z7IPf910w-dUqD59Too0yrUug6uHp7kF_J9H-JLWky5wy_VhmgYLzViiW5A42oFH_VkI9zNEJF3UJr4RLMPA_EYntU',
    date: '2023-10-12T19:30:00',
    // Subtotal: (5*12) + (3*17) + (4*22) = 60 + 51 + 88 = 199
    // Service Charge (10%): 19.9
    // Total: 218.9
    totalPrice: 218.90,
    totalPlates: 12,
    region: 'hk',
    currencySymbol: 'HK$',
    serviceChargeAmount: 19.90,
    serviceChargeRule: { type: 'percent', value: 10 },
    items: [
        { name: '红碟', price: 12, quantity: 5, type: 'plate', color: '#EF4444' },
        { name: '银碟', price: 17, quantity: 3, type: 'plate', color: '#D1D5DB' },
        { name: '金碟', price: 22, quantity: 4, type: 'plate', color: '#EAB308' },
    ]
  },
  {
    id: 'h2',
    brandName: '藏寿司',
    brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw30699LgHYL4jt2b-i_0r2RoVc86UqpsPlQiXe6M0bY7OIhoTjfMSMhlorfGQ90E8qPoBWuEgupgucpvGBpbsM1AxTXMz3TU2tLR_T1MBg7567_i7ckyQ1CfNqxeXZPu9vqWMJVlWs0FmQVbVoP0T9-NhUnaWwwDYJI8ePW-byNH-w0lhJMTaOxNVTmlvfxDzfJcMtaeu3TfFRRJ7fXuN2FrM0ErWrf0B_dwtZaaeeEkRB8_Zk8eYoXj80xOkZcB1Z7i0wJyIT8k',
    date: '2023-10-05T13:15:00',
    // Subtotal: 9 * 12 = 108
    // Service Charge (0%): 0
    // Total: 108
    totalPrice: 108.00,
    totalPlates: 9,
    region: 'mainland',
    currencySymbol: '¥',
    serviceChargeAmount: 0,
    serviceChargeRule: { type: 'none', value: 0 },
    items: [
        { name: '普通碟', price: 12, quantity: 9, type: 'plate', color: '#3B82F6' },
    ]
  }
];
