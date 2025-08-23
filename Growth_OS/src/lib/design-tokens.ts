// 设计系统 - 从Figma提取的设计规范
export const colors = {
  // 主要颜色
  primary: '#16b4f2',
  
  // 文本颜色
  text: {
    primary: '#000000',
    secondary: '#717171', 
    tertiary: '#C4C4C4',
    muted: '#AAAAAA',
    inverse: '#FFFFFF',
  },
  
  // 标签颜色
  tag: {
    ai: '#FF00D0',
    crypto: '#00B40F', 
    education: '#0060FF',
  },
  
  // 背景色
  background: {
    primary: '#FFFFFF',
    secondary: '#F1F3F4',
    blue: '#C1E8FF',
    glass: 'rgba(255, 255, 255, 0.35)',
  },
  
  // macOS交通灯
  macos: {
    close: '#FF5E58',
    minimize: '#FFBF30', 
    maximize: '#27C840',
  },
} as const

export const typography = {
  // 主要字体 - OPPO Sans 4.0
  fontFamily: {
    sans: ['OPPO Sans 4.0', 'system-ui', 'sans-serif'],
    brand: ['Alimama ShuHeiTi', 'system-ui', 'sans-serif'],
  },
  
  // 字体大小 - 从设计稿提取
  fontSize: {
    xs: '7px',     // 标签文字
    sm: '10px',    // 菜单项
    base: '12px',  // 正文、项目名
    md: '13px',    // 按钮文字
    lg: '14px',    // 导航、价格单位
    xl: '20px',    // 价格数字
  },
  
  // 字重
  fontWeight: {
    medium: 500,
    bold: 700,
  },
} as const

export const spacing = {
  // 从设计稿分析的间距规律
  xs: '4px',
  sm: '8px', 
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
} as const

export const borderRadius = {
  sm: '3px',
  md: '5px',
  lg: '10px',
  xl: '25px',
  full: '9999px',
} as const

export const shadows = {
  card: '0px 0px 4px 2px rgba(0, 0, 0, 0.25)',
  dropdown: '0px 0px 3px 2px black',
  button: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  tag: '0px 0px 2px 1px rgba(0, 0, 0, 0.25)',
} as const