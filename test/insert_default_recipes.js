const pool = require('./config/database');
const { v4: uuidv4 } = require('uuid');

// 默认菜谱数据
const defaultRecipes = [
  {
    title: "宫保鸡丁",
    image: "宫",
    category: "炒",
    difficulty: "中等",
    time: 30, // 转换为分钟数
    ingredients: [
      "鸡胸肉 200g",
      "花生米 50g",
      "干辣椒 10个",
      "葱姜蒜 适量",
      "料酒 1勺",
      "生抽 2勺",
      "老抽 1勺",
      "糖 1勺",
      "醋 1勺",
      "淀粉 适量"
    ],
    steps: [
      "鸡胸肉切丁，加入料酒、生抽、淀粉腌制15分钟",
      "花生米炒熟备用",
      "干辣椒切段，葱姜蒜切末",
      "调碗汁：生抽、老抽、糖、醋、淀粉、水混合",
      "热锅凉油，放入鸡丁炒至变色盛出",
      "锅中留油，放入干辣椒、葱姜蒜爆香",
      "放入鸡丁翻炒，倒入碗汁炒匀",
      "最后加入花生米炒匀即可"
    ]
  },
  {
    title: "西红柿炒鸡蛋",
    image: "西",
    category: "炒",
    difficulty: "简单",
    time: 15,
    ingredients: [
      "西红柿 2个",
      "鸡蛋 3个",
      "盐 适量",
      "糖 适量",
      "葱姜 适量"
    ],
    steps: [
      "鸡蛋打散，加入少许盐搅拌均匀",
      "西红柿切块",
      "热锅凉油，倒入鸡蛋液炒至定型盛出",
      "锅中留油，放入葱姜爆香",
      "放入西红柿翻炒至出汁",
      "加入盐和糖调味",
      "放入炒好的鸡蛋炒匀即可"
    ]
  },
  {
    title: "红烧肉",
    image: "红",
    category: "焖",
    difficulty: "中等",
    time: 60,
    ingredients: [
      "五花肉 500g",
      "冰糖 30g",
      "葱姜蒜 适量",
      "料酒 2勺",
      "生抽 2勺",
      "老抽 1勺",
      "八角 2个",
      "桂皮 1块",
      "香叶 2片"
    ],
    steps: [
      "五花肉切块，焯水去血水",
      "热锅凉油，放入冰糖炒糖色",
      "糖色炒至枣红色时，放入五花肉翻炒上色",
      "加入料酒、生抽、老抽炒匀",
      "加入葱姜蒜、八角、桂皮、香叶",
      "加入热水没过五花肉，大火烧开转小火炖40分钟",
      "最后大火收汁即可"
    ]
  },
  {
    title: "凉拌黄瓜",
    image: "凉",
    category: "拌",
    difficulty: "简单",
    time: 10,
    ingredients: [
      "黄瓜 2根",
      "蒜末 适量",
      "醋 2勺",
      "生抽 1勺",
      "盐 适量",
      "糖 适量",
      "香油 适量",
      "辣椒油 适量"
    ],
    steps: [
      "黄瓜洗净，拍碎后切成段",
      "加入蒜末、醋、生抽、盐、糖、香油和辣椒油",
      "搅拌均匀即可食用"
    ]
  },
  {
    title: "烤鸡翅",
    image: "烤",
    category: "烤",
    difficulty: "中等",
    time: 40,
    ingredients: [
      "鸡翅 10个",
      "生抽 2勺",
      "老抽 1勺",
      "料酒 1勺",
      "蜂蜜 1勺",
      "盐 适量",
      "黑胡椒粉 适量",
      "葱姜蒜 适量"
    ],
    steps: [
      "鸡翅洗净，划两刀方便入味",
      "加入生抽、老抽、料酒、盐、黑胡椒粉、葱姜蒜腌制2小时",
      "烤箱预热200度，将鸡翅放入烤盘",
      "烤15分钟后翻面，刷上蜂蜜再烤15分钟即可"
    ]
  }
];

async function insertDefaultRecipes() {
  try {
    // 获取第一个用户的ID作为默认菜谱的作者
    const [users] = await pool.execute('SELECT id FROM users LIMIT 1');

    if (users.length === 0) {
      throw new Error('数据库中没有用户，无法插入菜谱');
    }

    const userId = users[0].id;
    console.log(`使用用户ID作为菜谱作者: ${userId}`);

    // 批量插入菜谱
    for (const recipe of defaultRecipes) {
      try {
        const recipeId = uuidv4();
        await pool.execute(
          'INSERT INTO recipes (id, title, image, category, difficulty, time, ingredients, steps, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            recipeId,
            recipe.title,
            recipe.image,
            recipe.category,
            recipe.difficulty,
            recipe.time,
            JSON.stringify(recipe.ingredients),
            JSON.stringify(recipe.steps),
            userId
          ]
        );
        console.log(`✅ 菜谱 "${recipe.title}" 插入成功 (ID: ${recipeId})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️ 菜谱 "${recipe.title}" 已存在，跳过`);
        } else {
          console.error(`❌ 菜谱 "${recipe.title}" 插入失败:`, error.message);
        }
      }
    }

    console.log('\n🎉 默认菜谱插入完成！');

    // 验证插入结果
    const [recipes] = await pool.execute('SELECT id, title, category, difficulty, time FROM recipes ORDER BY createdAt');
    console.log('\n📋 当前数据库中的菜谱:');
    recipes.forEach(recipe => {
      console.log(`- ${recipe.title} (${recipe.category}, ${recipe.difficulty}, ${recipe.time}分钟)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 插入默认菜谱失败:', error.message);
    process.exit(1);
  }
}

// 执行插入操作
insertDefaultRecipes();