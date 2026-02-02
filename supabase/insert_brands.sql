-- =============================================
-- 快速插入预置品牌（如果数据库已创建但缺少品牌）
-- =============================================
-- 检查是否已有预置品牌
SELECT COUNT(*) as 品牌数量 FROM public.brands WHERE is_shared = true;

-- 如果上面显示0，执行下面的INSERT语句

-- 删除现有的预置品牌（如果需要重新插入）
-- DELETE FROM public.brands WHERE is_shared = true;

-- 插入6个预置品牌
INSERT INTO public.brands (id, user_id, name, description, logo_url, tags, default_service_charge, plates, side_dishes, region, is_shared)
VALUES
  -- 寿司郎 (Sushiro)
  (
    'sushiro',
    NULL,
    '寿司郎',
    '日本人气No.1回转寿司',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCJZkgYhNbeMOlKFLuORNl8E--9q6Yq04GXfglrc6Vp4V3nrRFh7dA_sC64SwnIzZR5dEBnS6c2ulA63moB95MIzNCi6O_pt_YrfpAVYvMQMzpSLi4z8ofQ-6aReLF1O6G7mjxK2FpmWCiWoHQL6K7QFf6VIAwDkU6_INmTNezFyjsa7KsNgt-LgLhSJHGvTBn-aNEATl3sVVmllqMiqNbHGjOiUynibRMlnbXoGhqSVOMi3pQYHLPX8uZTrCshVbdySoYhO8xw3Cs',
    ARRAY['hot'],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"p1","name":"红碟","color":"#EF4444","price":12},
      {"id":"p2","name":"银碟","color":"#D1D5DB","price":17},
      {"id":"p3","name":"金碟","color":"#EAB308","price":22},
      {"id":"p4","name":"黑碟","color":"#111827","price":27}
    ]'::jsonb,
    '[
      {"id":"s1","name":"拉面 / 乌冬","price":32,"icon":"ramen_dining"},
      {"id":"s2","name":"天妇罗 / 炸物","price":27,"icon":"tapas"},
      {"id":"s3","name":"饮料 / 酒类","price":18,"icon":"local_bar"}
    ]'::jsonb,
    'hk',
    true
  ),
  
  -- 藏寿司 (Kura Sushi)
  (
    'kura',
    NULL,
    '藏寿司',
    '坚持100%无添加',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDvdLQ2EcKEAvO4fgr-8i0hJZUWqod4xdPNVvmnFCpg8eQWCESVnYiyeJInP5gnbDEKO3VzkYPLUUD_muW-Xm4qQNvURbtAte1iVTueajFygrKCLIrjps4D2u5bUvWGPMhRh6zrAIyfi73K4T_8dzAxF6wrUGdPo0AYQUbXsWdRS_0K3iy89xiEm2LUipqNAZlGYMytDkX2o6g0sQH0jkpkkDwa_YbdmlfgA21SsXR0DYossTm4DfLcEbIREvrWOleFDmat1cnF0rI',
    ARRAY['new'],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"k1","name":"普通碟","color":"#3B82F6","price":12},
      {"id":"k2","name":"特殊碟","color":"#EF4444","price":24}
    ]'::jsonb,
    '[
      {"id":"s1","name":"味噌汤","price":18,"icon":"soup_kitchen"}
    ]'::jsonb,
    'hk',
    true
  ),
  
  -- 元气寿司 (Genki Sushi)
  (
    'genki',
    NULL,
    '元气寿司',
    '大众喜爱的经典选择',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJd9j8NBLCeiehzQqhNK7fUPtI8pfM4EKf_zlvQdSa2haz2hb1MhZGC0wvtHzBtCx7xLRz9F1mcVEaTAR3K-zg8i0QH0cZ0bep74lnWLTlHZsI5iOyYYpZChd9PU6T784Y1rGmPqKPiwqa5zlAbkvm73dYJGaEOHdIpzOFBCVMmj0sgC5zURNn2ClZXcWdz7Fy7uBQSufl_SoDFblfzHYJ5Zjb8_34WebJQQLV7AVhVPlkhXDznT9v_RXxZYfW08SWKlgQQtN_3z4',
    ARRAY[]::TEXT[],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"g1","name":"绿碟","color":"#22C55E","price":10},
      {"id":"g2","name":"红碟","color":"#EF4444","price":14}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  ),
  
  -- 争鲜 (Sushi Express)
  (
    'sushi_express',
    NULL,
    '争鲜',
    '高性价比的美味',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCPVjS2grA8SyqmGJly4ZqAzisbCMqWgh4Lijjk945fmz8Dk0ua89sCow1uMINTVFMzQuI6KisFqnGeNeydoOtckezMTltcvTwFZKCfsU1I163IgtW_5Wbgq8GWygQyk7_mEkSNzdH24VO6v3xVYjKrtB9Yi0im357-tmSvKs_Kl1swsdyaoKJf15svmkSTyApD5HKXqJe8Aa7gr_4SLo7lgSunY1YpM3ta8RiBSjSVPFbf_DYdWqUruyFoizPTop7-ExfpXReUGLk',
    ARRAY[]::TEXT[],
    '{"type":"none","value":0}'::jsonb,
    '[
      {"id":"se1","name":"粉碟","color":"#F472B6","price":6}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  ),
  
  -- 滨寿司 (Hama Sushi)
  (
    'hama',
    NULL,
    '滨寿司',
    '适合家庭聚餐',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB2fUg53B0wJA_EOB-Io4fY4jX-_AUFUXvRVA5cOCyr0nF5P7P6sh7ZKqw0Vw2SQITx2Sbk5yWTGIyHrJK349NsePMfwcvT6pX4Z1Qzy4V2V4wV3TlsU6CzubRzd0BE8CLIClwrpD4JF7T2JTLnDzCTnmrYrTh7gKrpLc__d19uyHjikWaM5nBWwUoNzD6btiHxUZSm00OW7uXCtPG0R_dWXvWC7ZvUZ0ocxewlFh4RpAV2GsIOim8L0eYRby6vSnwyfQNCskZ3HV0',
    ARRAY[]::TEXT[],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"h1","name":"标准","color":"#3B82F6","price":10}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  ),
  
  -- 板前寿司 (Itamae Sushi)
  (
    'itamae',
    NULL,
    '板前寿司',
    '职人手作精选',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuADSNxrW04V5iFbafCzFDaWDRkZd758FJuI2VXqqHq-2utOL-VWlS_DUvkw2Am9Qr2Lg_4BgczdLWb092zoj6_g4sgy8LeJL1K2FR_O4C2T5bJTL2U0Mgunshi0N62QDBWOphS1CUQMs4GDrGpcxz6G0yh3Cab-5EA-9AtU6si0MQHPIVqXoqUQELJTZ6HsVFKBejpcve8okj8c_N9EaPvY1cURk4KPEPU4wEowgeOx4NDTm7p6KEfO9iRnDH-QWgMt6K7MlODhNQU',
    ARRAY[]::TEXT[],
    '{"type":"percent","value":10}'::jsonb,
    '[
      {"id":"i1","name":"黑金","color":"#000000","price":35}
    ]'::jsonb,
    '[]'::jsonb,
    'hk',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 验证插入结果
SELECT id, name, is_shared FROM public.brands WHERE is_shared = true;
