'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

interface GLBDiamondProps {
  modelPath: string
  size: number
  brightness: number
  className?: string
  backgroundColor?: string
  lightColor?: string
  rotationSpeed?: number
  onClick?: () => void
  interactive?: boolean
}

export function GLBDiamondModel({ 
  modelPath, 
  size, 
  brightness, 
  className = '', 
  backgroundColor = 'transparent',
  lightColor = '#ffffff',
  rotationSpeed = 0.001, // 进一步降低默认旋转速度
  onClick,
  interactive = false
}: GLBDiamondProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!containerRef.current || !mounted) return
    
    // 场景、相机、渲染器
    const scene = new THREE.Scene()
    
    // 添加环境贴图以增强反射效果
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    const envMap = cubeTextureLoader.load([
      '/envmap/px.jpg', '/envmap/nx.jpg',
      '/envmap/py.jpg', '/envmap/ny.jpg',
      '/envmap/pz.jpg', '/envmap/nz.jpg'
    ])
    scene.environment = envMap
    
    // 设置背景色
    if (backgroundColor !== 'transparent') {
      scene.background = new THREE.Color(backgroundColor)
    } else {
      scene.background = null
    }
    
    // 创建相机 - 调整视距让钻石更大
    const camera = new THREE.PerspectiveCamera(
      60, // 增大视角让钻石看起来更大
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    )
    camera.position.z = 6 // 将相机拉近，从10调整到6
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: backgroundColor === 'transparent'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    
    if (backgroundColor === 'transparent') {
      renderer.setClearColor(0x000000, 0)
    }
    
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    
    // 添加轨道控制器（仅在交互模式下启用）
    const controls = interactive ? new OrbitControls(camera, renderer.domElement) : null
    if (controls) {
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.rotateSpeed = 0.5
      controls.enablePan = false
      controls.enableZoom = true
      controls.autoRotate = false
      controls.minDistance = 3 // 更近的距离，可以看到钻石细节
      controls.maxDistance = 10 // 适中的最大距离，保持整体感
      controls.zoomSpeed = 0.8 // 控制缩放速度
    }
    
    // 添加柔和的环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    // 方案：单一斜顶光源 - 模拟自然光
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.4)
    mainLight.position.set(2, 4, 3) // 右上前方，模拟自然光线角度
    mainLight.target.position.set(0, 0, 0)
    scene.add(mainLight)
    scene.add(mainLight.target)
    
    // 添加轮廓光 - 从侧面增强立体感
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.15)
    rimLight.position.set(-4, 1, -2) // 左后侧
    rimLight.target.position.set(0, 0, 0)
    scene.add(rimLight)
    scene.add(rimLight.target)
    
    // 底部反弹光 - 微弱填充阴影
    const bounceLight = new THREE.DirectionalLight(0xffffff, 0.08)
    bounceLight.position.set(0, -3, 2) // 底部前方
    bounceLight.target.position.set(0, 0, 0)
    scene.add(bounceLight)
    scene.add(bounceLight.target)
    
    // 加载GLB模型
    const loader = new GLTFLoader()
    let diamondModel: THREE.Group | null = null
    
    loader.load(
      modelPath,
      (gltf) => {
        diamondModel = gltf.scene
        
        // 最小化材质修改，尽量保持原始外观
        diamondModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              // 检查是否是物理材质，如果是则轻微调整
              const material = child.material as THREE.MeshPhysicalMaterial
              if (material.isMeshPhysicalMaterial) {
                // 尽量保持原始设置，只做最小调整
                material.roughness = Math.min(material.roughness || 0, 0.05)
                material.metalness = Math.min(material.metalness || 0, 0.05)
                // 不修改透明度和transmission，保持原始外观
              } else {
                // 对于其他材质类型，确保它们能正确响应光照
                if (material.type === 'MeshStandardMaterial' || material.type === 'MeshLambertMaterial') {
                  (material as any).roughness = Math.min((material as any).roughness || 0, 0.1)
                  ;(material as any).metalness = Math.min((material as any).metalness || 0, 0.1)
                }
              }
              // 确保材质更新
              material.needsUpdate = true
            }
          }
        })
        
        // 调整模型大小 - 进一步放大
        const box = new THREE.Box3().setFromObject(diamondModel)
        const center = box.getCenter(new THREE.Vector3())
        const size3D = box.getSize(new THREE.Vector3())
        
        // 计算缩放比例，使模型更大更突出
        const maxDim = Math.max(size3D.x, size3D.y, size3D.z)
        const scale = 5 / maxDim // 从3增加到5，让钻石更大
        
        diamondModel.scale.set(scale, scale, scale)
        
        // 将模型居中
        diamondModel.position.sub(center.multiplyScalar(scale))
        
        // 添加模型到场景
        scene.add(diamondModel)
        setLoading(false)
      },
      (xhr) => {
        // 加载进度
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      },
      (error) => {
        console.error('加载GLB模型时出错:', error)
        setError('加载模型失败')
        setLoading(false)
      }
    )
    
    // 移除闪光效果
    
    // 动画变量
    let time = 0
    let animationFrameId: number | null = null
    let mouseOver = false
    
    // 动画循环
    const animate = () => {
      time += 0.01
      
      // 更新控制器
      if (controls) {
        controls.update()
      }
      
      // 旋转模型
      if (diamondModel && !mouseOver && !interactive) {
        diamondModel.rotation.y += rotationSpeed
      }
      
      // 闪光动画已移除
      
      // 自然光线的轻微变化，模拟真实环境
      mainLight.intensity = 0.4 + Math.sin(time * 0.5) * 0.05
      rimLight.intensity = 0.15 + Math.sin(time * 0.3) * 0.02
      bounceLight.intensity = 0.08 + Math.sin(time * 0.7) * 0.01
      
      // 渲染场景
      renderer.render(scene, camera)
      
      // 继续动画循环
      animationFrameId = requestAnimationFrame(animate)
    }
    
    // 鼠标交互事件
    const handleMouseOver = () => {
      if (!interactive) {
        mouseOver = true
        document.body.style.cursor = 'pointer'
      }
    }
    
    const handleMouseOut = () => {
      if (!interactive) {
        mouseOver = false
        document.body.style.cursor = 'default'
      }
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (!containerRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      
      renderer.setSize(width, height)
    }
    
    // 添加事件监听器
    const rendererDomElement = renderer.domElement
    rendererDomElement.addEventListener('mouseover', handleMouseOver)
    rendererDomElement.addEventListener('mouseout', handleMouseOut)
    if (onClick) {
      rendererDomElement.addEventListener('click', onClick)
    }
    window.addEventListener('resize', handleResize)
    
    // 开始动画
    animate()
    
    // 清理函数
    return () => {
      // 移除事件监听器
      window.removeEventListener('resize', handleResize)
      rendererDomElement.removeEventListener('mouseover', handleMouseOver)
      rendererDomElement.removeEventListener('mouseout', handleMouseOut)
      if (onClick) {
        rendererDomElement.removeEventListener('click', onClick)
      }
      
      // 停止动画
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      
      // 释放控制器
      if (controls) {
        controls.dispose()
      }
      
      // 释放几何体和材质
      if (diamondModel) {
        diamondModel.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) {
              object.geometry.dispose()
            }
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          }
        })
      }
      
      // 闪光效果已移除，不需要清理
      
      // 从容器中移除渲染器的DOM元素
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      
      // 释放渲染器
      renderer.dispose()
    }
  }, [modelPath, size, brightness, backgroundColor, lightColor, rotationSpeed, onClick, interactive, mounted])
  
  return (
    <div 
      ref={containerRef} 
      className={`glb-diamond-model ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '200px',
        position: 'relative'
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/30 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/30 backdrop-blur-sm">
          <div className="text-red-600">{error}</div>
        </div>
      )}
    </div>
  )
}