import { DiamondCase } from "@/components/diamond-case-card"

// 创建案例数据
export const diamondCases: DiamondCase[] = [
  // 誓言项目自己的案例 - 使用the_best_big_diamond.glb
  {
    id: "oath-platform",
    title: "誓言平台 - 链上信用的缔造者",
    description: "誓言平台通过区块链技术构建去中心化的信用体系，让人们通过发誓这一举动建立信任。平台支持超额抵押机制，并通过信用钻石NFT展示和传递信任，实现链上原生的信用体系。\n\n誓言平台的核心理念是将人的信任因素引入链上，通过誓言NFT建立对人的信任管理。用户可以通过发出誓言并抵押资产来建立初始信用，随着誓言的完成和积累，用户可以获得更高的信用值，并在未来发誓时减少抵押需求，甚至无需抵押。\n\n誓言一旦发出，链上任何人都能看到，这种透明度让项目方能够通过发布\"绝不跑路\"的誓言来获得用户的信任。用户可以通过自己的誓言来背书他人的誓言，形成信任的传递和汇聚。",
    modelPath: "/resouce/diamond/the_best_big_diamond.glb",
    creditValue: 50000,
    category: "平台项目",
    tags: ["区块链", "信用体系", "去中心化", "誓言", "信任"],
    backgroundColor: "transparent", // 原来是 "#081730",
    lightColor: "#4d7cfe",
    rotationSpeed: 0.001,
    createdAt: new Date("2023-10-01"),
    endorseCount: 1258
  },
  
  // 为现有的3个案例选择合适的模型
  // 案例1: DeFi项目维护大师 - 使用brilliand_diamond.glb
  {
    id: "defi-master",
    title: "DeFi项目维护大师",
    description: "成功维护DeFi项目2年，展现了卓越的项目管理能力和技术实力。通过誓言承诺长期维护，确保项目的安全性和稳定性，获得了社区的高度信任。\n\n在传统中心化世界中，项目维护通常依赖于公司的声誉和合同约束。而在去中心化社会中，通过誓言平台，个人开发者可以直接向社区发出维护承诺，并通过抵押和过往记录建立信任。\n\n该誓言持有者已经成功维护多个DeFi项目，包括流动性协议、借贷平台和去中心化交易所，展现了卓越的技术能力和责任心。社区成员可以直接与誓言持有者合作，无需通过传统的公司或中介机构。",
    modelPath: "/resouce/diamond/brilliand_diamond.glb",
    creditValue: 15000,
    category: "项目承诺",
    tags: ["DeFi", "项目维护", "技术", "长期承诺"],
    backgroundColor: "transparent", // 原来是 "#1a0b2e",
    lightColor: "#9333ea",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-01-20"),
    endorseCount: 347
  },
  
  // 案例2: 安全审计专家 - 使用faceted_diamond_or_brilliant.glb
  {
    id: "audit-expert",
    title: "安全审计专家",
    description: "高质量完成智能合约安全审计，保障了项目的安全性。通过专业的安全审计技能和经验，帮助多个项目识别并修复潜在的安全漏洞，建立了良好的专业信誉。\n\n在传统世界中，安全审计通常由知名审计公司提供，成本高昂且周期较长。在去中心化社会中，个人安全专家可以通过誓言平台直接向项目方提供审计服务，基于过往记录和信用钻石建立信任。\n\n该誓言持有者已经成功审计了超过20个智能合约项目，发现并协助修复了多个高危漏洞，为DeFi生态系统的安全做出了重要贡献。项目方可以根据审计专家的信用钻石等级和背书情况，选择合适的审计服务提供者。",
    modelPath: "/resouce/diamond/faceted_diamond_or_brilliant.glb",
    creditValue: 2500,
    category: "商业承诺",
    tags: ["安全审计", "智能合约", "漏洞检测", "专业服务"],
    backgroundColor: "transparent", // 原来是 "#001e3c",
    lightColor: "#3b82f6",
    rotationSpeed: 0.015,
    createdAt: new Date("2024-12-01"),
    endorseCount: 89
  },
  
  // 案例3: 配送服务之星 - 使用green_diamond.glb
  {
    id: "delivery-star",
    title: "配送服务之星",
    description: "连续30天准时完成外卖配送，获得客户一致好评。通过誓言承诺高质量的配送服务，并通过实际行动兑现承诺，建立了良好的服务信誉。\n\n在传统外卖平台中，配送员的评价和信誉通常被平台控制，且难以跨平台迁移。在去中心化社会中，配送员可以通过誓言平台建立独立的信用记录，不再受制于单一平台。\n\n该誓言持有者通过准时、安全的配送服务，获得了客户的高度认可。随着信用的积累，他可以直接接受客户的配送委托，无需依赖中心化的外卖平台，享受更高的收入和更灵活的工作方式。",
    modelPath: "/resouce/diamond/green_diamond.glb",
    creditValue: 500,
    category: "服务交付",
    tags: ["外卖配送", "准时", "服务质量", "客户满意度"],
    backgroundColor: "transparent", // 原来是 "#052e16",
    lightColor: "#22c55e",
    rotationSpeed: 0.02,
    createdAt: new Date("2024-11-15"),
    endorseCount: 42
  },
  
  // 其他代表性案例
  // 案例4: 去中心化公证服务 - 使用diamond_blue_multi-faceted.glb
  {
    id: "decentralized-notary",
    title: "去中心化公证服务",
    description: "提供去中心化的公证服务，通过区块链技术确保文件的真实性和时间戳。替代传统公证处，提供更高效、透明的公证服务，降低了公证成本和时间。\n\n在传统社会中，公证服务由政府授权的公证机构提供，流程复杂且成本高昂。在去中心化社会中，具有法律背景的个人可以通过誓言平台提供公证服务，利用区块链技术确保文件的真实性和不可篡改性。\n\n该誓言持有者已经为数百份合同和文件提供了公证服务，确保了交易的安全和有效性。用户可以根据公证人的信用钻石等级和背书情况，选择合适的公证服务提供者，无需依赖传统的公证机构。",
    modelPath: "/resouce/diamond/diamond_blue_multi-faceted.glb",
    creditValue: 8000,
    category: "公共服务",
    tags: ["公证", "区块链", "文件认证", "去中心化政务"],
    backgroundColor: "transparent", // 原来是 "#0c4a6e",
    lightColor: "#0ea5e9",
    rotationSpeed: 0.008,
    createdAt: new Date("2024-05-15"),
    endorseCount: 203
  },
  
  // 案例5: 身份证办理专家 - 使用blue_colored_realistic_diamond_model.glb
  {
    id: "id-service-expert",
    title: "身份证办理专家",
    description: "提供高效的身份证办理服务，替代传统行政大厅。通过誓言承诺专业、高效的服务，帮助人们更便捷地办理身份证相关业务，节省时间和精力。\n\n在传统社会中，身份证办理需要前往政府行政大厅，往往面临排队等待、流程复杂等问题。在去中心化社会中，具有相关经验的个人可以通过誓言平台提供身份证办理代理服务，简化流程并提高效率。\n\n该誓言持有者已经帮助数百人成功办理了身份证申请、更换和挂失等业务，熟悉各种特殊情况的处理方法。用户可以根据服务提供者的信用钻石等级和评价，选择可靠的代理人，避免了亲自前往行政大厅的麻烦。",
    modelPath: "/resouce/diamond/blue_colored_realistic_diamond_model.glb",
    creditValue: 3500,
    category: "公共服务",
    tags: ["身份证", "政务服务", "高效办理", "去中心化政务"],
    backgroundColor: "transparent", // 原来是 "#172554",
    lightColor: "#3b82f6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-06-20"),
    endorseCount: 156
  },
  
  // 案例6: 去中心化婚姻登记 - 使用rough_diamond_ring.glb
  {
    id: "decentralized-marriage",
    title: "去中心化婚姻登记",
    description: "提供基于区块链的婚姻登记服务，让婚姻契约更加透明和可靠。通过智能合约记录婚姻状态，提供更灵活、更现代的婚姻关系管理方式。\n\n在传统社会中，婚姻登记由政府民政部门管理，往往缺乏灵活性和个性化选择。在去中心化社会中，具有法律背景的个人可以通过誓言平台提供婚姻登记和契约服务，基于区块链技术确保婚姻契约的透明和不可篡改。\n\n该誓言持有者已经为数百对伴侣提供了婚姻契约服务，包括传统婚姻、定期更新婚姻和条件型婚姻等多种形式。伴侣可以根据自己的需求，选择适合的婚姻形式和条款，实现真正个性化的婚姻关系。",
    modelPath: "/resouce/diamond/rough_diamond_ring.glb",
    creditValue: 7500,
    category: "婚姻服务",
    tags: ["婚姻", "区块链", "智能合约", "去中心化"],
    backgroundColor: "transparent", // 原来是 "#831843",
    lightColor: "#ec4899",
    rotationSpeed: 0.007,
    createdAt: new Date("2024-02-14"),
    endorseCount: 289
  },
  
  // 案例7: 社区医疗服务 - 使用diamond_green.glb
  {
    id: "community-healthcare",
    title: "社区医疗服务",
    description: "提供社区基础医疗服务，包括健康咨询、基础诊断和用药指导。通过誓言承诺专业的医疗服务，让更多人能够便捷地获得基础医疗帮助。\n\n在传统社会中，医疗服务高度依赖医院和诊所，面临挂号难、等待时间长等问题。在去中心化社会中，具有医学背景的个人可以通过誓言平台直接向社区提供基础医疗服务，降低医疗资源获取的门槛。\n\n该誓言持有者是一名有执业资格的医生，通过社区医疗服务，为数百名居民提供了健康咨询和基础诊断。居民可以根据医生的信用钻石等级和专业背景，选择合适的医疗服务提供者，享受更便捷、个性化的医疗服务。",
    modelPath: "/resouce/diamond/diamond_green.glb",
    creditValue: 6000,
    category: "医疗服务",
    tags: ["医疗", "社区服务", "健康咨询", "基础诊断"],
    backgroundColor: "transparent", // 原来是 "#064e3b",
    lightColor: "#10b981",
    rotationSpeed: 0.009,
    createdAt: new Date("2024-03-10"),
    endorseCount: 178
  },
  
  // 案例8: 教育辅导专家 - 使用diamond_ordinary.glb
  {
    id: "education-tutor",
    title: "教育辅导专家",
    description: "提供高质量的教育辅导服务，帮助学生提高学习成绩和能力。通过誓言承诺专业、耐心的教学，建立了良好的教育信誉。\n\n在传统社会中，教育辅导往往依赖培训机构或个人口碑，难以客观评估教学质量。在去中心化社会中，教师可以通过誓言平台建立个人教学信用，基于过往成果和学生评价形成可信的教学记录。\n\n该誓言持有者是一名经验丰富的教师，专注于数学和科学学科的辅导，已经帮助数十名学生显著提高了学习成绩。学生和家长可以根据教师的信用钻石等级和专业背景，选择合适的辅导老师，获得更有针对性的学习帮助。",
    modelPath: "/resouce/diamond/diamond_ordinary.glb",
    creditValue: 2800,
    category: "教育服务",
    tags: ["教育", "辅导", "学习提升", "知识传递"],
    backgroundColor: "transparent", // 原来是 "#0f172a",
    lightColor: "#6366f1",
    rotationSpeed: 0.012,
    createdAt: new Date("2024-04-05"),
    endorseCount: 92
  },
  
  // 案例9: 环保项目倡导者 - 使用diamond_rock.glb
  {
    id: "environmental-advocate",
    title: "环保项目倡导者",
    description: "发起并维护环保项目，促进社区可持续发展。通过誓言承诺长期投入环保事业，组织社区活动，提高环保意识，实现更绿色的生活方式。\n\n在传统社会中，环保项目往往依赖政府或大型NGO组织，资源分配不均且执行效率有限。在去中心化社会中，环保倡导者可以通过誓言平台直接发起和管理环保项目，获得社区的信任和支持。\n\n该誓言持有者已经成功组织了多次社区清洁活动、废物回收计划和环保教育讲座，显著提高了社区的环保意识和参与度。社区成员可以根据倡导者的信用钻石等级和过往项目成果，选择支持可靠的环保项目，共同建设更可持续的社区环境。",
    modelPath: "/resouce/diamond/diamond_rock.glb",
    creditValue: 4500,
    category: "环保项目",
    tags: ["环保", "可持续发展", "社区活动", "绿色生活"],
    backgroundColor: "transparent", // 原来是 "#14532d",
    lightColor: "#22c55e",
    rotationSpeed: 0.006,
    createdAt: new Date("2024-04-22"),
    endorseCount: 134
  },
  
  // 案例10: 区块链开发专家 - 使用diamond_simple_but_nice.glb
  {
    id: "blockchain-developer",
    title: "区块链开发专家",
    description: "提供专业的区块链开发服务，包括智能合约编写、DApp开发和区块链集成。通过誓言承诺高质量的开发交付，帮助项目实现区块链技术的应用。\n\n在传统软件开发市场中，开发者的能力评估往往依赖简历、面试和第三方推荐。在去中心化社会中，开发者可以通过誓言平台建立个人技术信用，基于过往项目和代码质量形成可信的能力证明。\n\n该誓言持有者是一名经验丰富的区块链开发者，已经成功完成了多个智能合约和DApp项目，代码安全可靠且性能优异。项目方可以根据开发者的信用钻石等级和技术背景，选择合适的技术合作伙伴，无需依赖传统的招聘流程和中介机构。",
    modelPath: "/resouce/diamond/diamond_simple_but_nice.glb",
    creditValue: 9000,
    category: "技术服务",
    tags: ["区块链", "开发", "智能合约", "DApp"],
    backgroundColor: "transparent", // 原来是 "#0f172a",
    lightColor: "#8b5cf6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-01-05"),
    endorseCount: 215
  },
  
  // 案例11: 社区治理参与者 - 使用diamond_simple_but_nice2.glb
  {
    id: "community-governance",
    title: "社区治理参与者",
    description: "积极参与DAO社区治理，提供建设性意见和方案。通过誓言承诺公正、客观的治理参与，促进社区的健康发展和决策透明度。\n\n在传统组织治理中，决策权往往集中在少数管理层手中，普通成员参与度有限。在去中心化社会中，社区成员可以通过誓言平台参与DAO治理，基于个人信用和专业知识影响集体决策。\n\n该誓言持有者活跃于多个DAO的治理过程，提出了多项改进提案并参与关键决策投票，展现了深入的行业洞察和治理经验。社区可以根据参与者的信用钻石等级和治理记录，识别有价值的治理贡献者，提高集体决策的质量和效率。",
    modelPath: "/resouce/diamond/diamond_simple_but_nice2.glb",
    creditValue: 3200,
    category: "社区治理",
    tags: ["DAO", "治理", "社区决策", "透明度"],
    backgroundColor: "transparent", // 原来是 "#1e1b4b",
    lightColor: "#818cf8",
    rotationSpeed: 0.011,
    createdAt: new Date("2024-02-28"),
    endorseCount: 87
  },
  
  // 案例12: 去中心化法律咨询 - 使用diamond_simple.glb
  {
    id: "decentralized-legal",
    title: "去中心化法律咨询",
    description: "提供基础的法律咨询服务，帮助人们了解法律知识和权益保护。通过誓言承诺专业、准确的法律建议，降低了法律服务的门槛和成本。\n\n在传统社会中，法律咨询往往需要支付高昂的律师费用，普通人难以获得及时的法律帮助。在去中心化社会中，具有法律背景的个人可以通过誓言平台直接提供法律咨询服务，使法律帮助更加普及和平价。\n\n该誓言持有者是一名有执业资格的律师，通过在线平台为数百人提供了合同审查、权益保护和法律程序指导等服务。用户可以根据律师的信用钻石等级和专业领域，选择合适的法律顾问，获得更便捷、经济的法律帮助。",
    modelPath: "/resouce/diamond/diamond_simple.glb",
    creditValue: 5500,
    category: "法律服务",
    tags: ["法律", "咨询", "权益保护", "专业建议"],
    backgroundColor: "transparent", // 原来是 "#1e293b",
    lightColor: "#f59e0b",
    rotationSpeed: 0.009,
    createdAt: new Date("2024-03-15"),
    endorseCount: 143
  },
  
  // 案例13: 艺术创作者信用 - 使用diamond_simple_3.glb
  {
    id: "art-creator",
    title: "艺术创作者信用",
    description: "承诺原创艺术作品创作，确保作品的真实性和独特性。通过誓言承诺不侵犯他人知识产权，提供真实的艺术创作，建立创作者的信誉。\n\n在传统艺术市场中，作品的真实性和原创性往往难以验证，存在抄袭和造假的风险。在去中心化社会中，艺术创作者可以通过誓言平台承诺原创创作，并将作品记录在区块链上，确保其真实性和可追溯性。\n\n该誓言持有者是一名数字艺术家，创作了多幅独特的数字艺术作品，并通过区块链技术确保了作品的唯一性和所有权。艺术收藏家可以根据创作者的信用钻石等级和创作历史，识别真实、有价值的艺术作品，避免投资于抄袭或造假作品。",
    modelPath: "/resouce/diamond/diamond_simple_3.glb",
    creditValue: 2000,
    category: "艺术创作",
    tags: ["艺术", "原创", "创作", "知识产权"],
    backgroundColor: "transparent", // 原来是 "#422006",
    lightColor: "#f59e0b",
    rotationSpeed: 0.014,
    createdAt: new Date("2024-05-01"),
    endorseCount: 76
  },
  
  // 案例14: 去中心化房产交易 - 使用 5_diamond_combination.glb
  {
    id: "decentralized-realestate",
    title: "去中心化房产交易",
    description: "提供基于区块链的房产交易服务，确保交易的安全性和透明度。通过誓言承诺真实、可靠的房产信息和交易流程，降低了房产交易的风险和成本。\n\n在传统房产市场中，交易往往需要多个中介机构参与，流程复杂且成本高昂。在去中心化社会中，具有房产专业背景的个人可以通过誓言平台直接提供房产交易服务，使用智能合约简化交易流程并提高透明度。\n\n该誓言持有者已经促成了数十笔房产交易，熟悉各类房产的估值、法律程序和交易注意事项。买卖双方可以根据服务提供者的信用钻石等级和交易记录，选择可靠的交易顾问，享受更高效、透明的房产交易体验。",
    modelPath: "/resouce/diamond/5_diamond_combination.glb",
    creditValue: 12000,
    category: "房产服务",
    tags: ["房产", "区块链", "交易", "透明度"],
    backgroundColor: "transparent", // 原来是 "#0f172a",
    lightColor: "#06b6d4",
    rotationSpeed: 0.008,
    createdAt: new Date("2024-01-10"),
    endorseCount: 267
  },
  
  // 案例15: 社区食品安全监督 - 使用 4_combination_white_diamond.glb
  {
    id: "food-safety",
    title: "社区食品安全监督",
    description: "提供社区食品安全监督服务，确保食品的质量和安全。通过誓言承诺公正、严格的食品安全检查，保障社区居民的健康和安全。\n\n在传统社会中，食品安全监督主要由政府部门负责，覆盖范围有限且响应速度较慢。在去中心化社会中，具有食品安全专业背景的个人可以通过誓言平台为社区提供食品安全监督服务，实现更及时、精准的安全保障。\n\n该誓言持有者是一名食品安全专家，定期对社区内的餐厅、食品店和市场进行检查和评估，及时发现并报告潜在的安全隐患。社区居民可以根据监督者的信用钻石等级和专业背景，获取可靠的食品安全信息，做出更明智的消费选择。",
    modelPath: "/resouce/diamond/4_combination_white_diamond.glb",
    creditValue: 4200,
    category: "安全服务",
    tags: ["食品安全", "社区监督", "健康保障", "质量检查"],
    backgroundColor: "transparent", // 原来是 "#0f766e",
    lightColor: "#14b8a6",
    rotationSpeed: 0.01,
    createdAt: new Date("2024-04-15"),
    endorseCount: 128
  }
];
