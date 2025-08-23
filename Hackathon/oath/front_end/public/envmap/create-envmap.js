// 这是一个简单的脚本，用于创建环境贴图
// 实际项目中，您应该使用真实的HDRI环境贴图来获得更好的效果
// 这里我们只是创建一些简单的渐变图像作为示例

const fs = require('fs');
const { createCanvas } = require('canvas');

// 创建一个简单的渐变贴图
function createGradientMap(filename, colorTop, colorBottom) {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  
  // 创建渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);
  
  // 填充渐变
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // 保存文件
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(filename, buffer);
  
  console.log(`Created ${filename}`);
}

// 创建六个面的贴图
createGradientMap('px.jpg', '#8080FF', '#4040CC'); // 右
createGradientMap('nx.jpg', '#8080FF', '#4040CC'); // 左
createGradientMap('py.jpg', '#FFFFFF', '#8080FF'); // 上
createGradientMap('ny.jpg', '#4040CC', '#000040'); // 下
createGradientMap('pz.jpg', '#8080FF', '#4040CC'); // 前
createGradientMap('nz.jpg', '#8080FF', '#4040CC'); // 后

console.log('All environment maps created!');
