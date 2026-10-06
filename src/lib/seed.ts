import { db } from "./db.ts";
import { savePlaceholderImage } from "./images.ts";

interface SeedProduct {
  name: string;
  description: string;
  priceCents: number;
  category: string;
  stock: number;
  label: string;
  bg: string;
}

const products: SeedProduct[] = [
  { name: "无线蓝牙耳机 Pro", description: "主动降噪，30 小时超长续航，蓝牙 5.4 连接稳定，通勤运动都合适。", priceCents: 19900, category: "数码", stock: 50, label: "耳机", bg: "#e0e7ff" },
  { name: "智能运动手环", description: "心率血氧监测，50 米防水，14 天续航，记录每一次运动。", priceCents: 14900, category: "数码", stock: 80, label: "手环", bg: "#dbeafe" },
  { name: "机械键盘 87 键", description: "青轴清脆手感，PBT 键帽不打油，全键无冲，办公游戏两相宜。", priceCents: 32900, category: "数码", stock: 35, label: "键盘", bg: "#c7d2fe" },
  { name: "人体工学无线鼠标", description: "静音按键，三档 DPI 调节，贴合手型久用不累。", priceCents: 8900, category: "数码", stock: 65, label: "鼠标", bg: "#d1fae5" },
  { name: "不锈钢保温杯 500ml", description: "316 不锈钢内胆，24 小时长效保温，一键弹盖单手可开。", priceCents: 5900, category: "家居", stock: 120, label: "水杯", bg: "#fef3c7" },
  { name: "香薰蜡烛礼盒", description: "天然大豆蜡，三种香型，单支可燃烧约 45 小时，送礼自用皆宜。", priceCents: 3990, category: "家居", stock: 60, label: "蜡烛", bg: "#fee2e2" },
  { name: "纯棉宽松 T 恤", description: "新疆长绒棉，亲肤透气不闷汗，多色可选，四季百搭。", priceCents: 7900, category: "服饰", stock: 200, label: "T恤", bg: "#dcfce7" },
  { name: "轻便跑步鞋", description: "缓震鞋底回弹舒适，透气网面不闷脚，日常穿搭也好看。", priceCents: 29900, category: "服饰", stock: 0, label: "跑鞋", bg: "#e0f2fe" },
  { name: "帆布双肩包", description: "大容量可装 15.6 寸电脑，面料防泼水，通勤上学都合适。", priceCents: 12900, category: "服饰", stock: 90, label: "背包", bg: "#fde68a" },
  { name: "每日坚果礼盒 30 包", description: "六种坚果科学配比，独立小包装，每天一包刚刚好。", priceCents: 8990, category: "食品", stock: 150, label: "坚果", bg: "#fef9c3" },
  { name: "挂耳咖啡 20 包", description: "云南阿拉比卡豆，中度烘焙，现磨锁鲜，办公室手冲首选。", priceCents: 6800, category: "食品", stock: 100, label: "咖啡", bg: "#e7e5e4" },
  { name: "《三体》全集（全 3 册）", description: "刘慈欣科幻巨著，含雨果奖获奖作品，科幻迷必读。", priceCents: 9300, category: "图书", stock: 75, label: "三体", bg: "#f3e8ff" },
];

db.exec("DELETE FROM order_items; DELETE FROM orders; DELETE FROM products;");
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('products', 'orders', 'order_items');");

const insert = db.prepare(
  "INSERT INTO products (name, description, price_cents, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)"
);

products.forEach((p) => {
  const image = savePlaceholderImage(p.label, p.bg);
  insert.run(p.name, p.description, p.priceCents, image, p.category, p.stock);
});

console.log(`已重置数据库并写入 ${products.length} 件示例商品。`);
