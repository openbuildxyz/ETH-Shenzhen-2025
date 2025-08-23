'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface DiamondDetail3DProps {
  color: string
  size: number
  brightness: number
  className?: string
}

export function DiamondDetail3D({ color, size, brightness, className = '' }: DiamondDetail3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  
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
    scene.background = null // 保持背景透明
    
    const camera = new THREE.PerspectiveCamera(
      60, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    )
    camera.position.z = 3
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0) // 透明背景
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputEncoding = THREE.sRGBEncoding
    containerRef.current.appendChild(renderer.domElement)
    
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enablePan = false
    controls.enableZoom = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.5
    
    // 将颜色字符串转换为THREE.Color
    const diamondColor = new THREE.Color(color)
    
    // 创建更真实的钻石几何体
    const createRealDiamond = () => {
      const diamondGroup = new THREE.Group()
      
      // 创建一个真正的钻石几何体，使用多面体
      // 标准圆形钻石有58个面（57个或58个面，取决于是否有底尖）
      
      // 1. 创建钻石顶部（冠部）
      const crownHeight = 0.4
      const crownBaseRadius = 1.0
      const tableRadius = 0.6 * crownBaseRadius
      
      // 顶部平面（表面）
      const tableGeometry = new THREE.CircleGeometry(tableRadius, 8)
      tableGeometry.rotateX(-Math.PI / 2)
      tableGeometry.translate(0, crownHeight, 0)
      
      // 2. 创建钻石底部（亭部）
      const pavilionHeight = 0.8
      const pavilionBaseRadius = crownBaseRadius
      const culetRadius = 0.03 // 底尖，非常小
      
      // 3. 创建更逼真的钻石材质
      const material = new THREE.MeshPhysicalMaterial({
        color: diamondColor,
        transparent: true,
        opacity: 0.7,
        metalness: 0.1,
        roughness: 0.0,
        reflectivity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        ior: 2.4, // 钻石的折射率
        transmission: 0.95, // 透光率
        specularIntensity: 1.0,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide
      })
      
      // 创建钻石各个面
      
      // 创建表面
      const tableMesh = new THREE.Mesh(tableGeometry, material)
      diamondGroup.add(tableMesh)
      
      // 创建星形面（从表面到腰部的面）
      const starFacetsCount = 8 // 8个星形面
      const starFacetsGroup = new THREE.Group()
      
      for (let i = 0; i < starFacetsCount; i++) {
        const angle = (i / starFacetsCount) * Math.PI * 2
        const nextAngle = ((i + 1) / starFacetsCount) * Math.PI * 2
        
        const starFacetShape = new THREE.Shape()
        // 表面边缘的点
        const tableX1 = tableRadius * Math.cos(angle)
        const tableZ1 = tableRadius * Math.sin(angle)
        const tableX2 = tableRadius * Math.cos(nextAngle)
        const tableZ2 = tableRadius * Math.sin(nextAngle)
        
        // 腰部的点
        const girdleX1 = crownBaseRadius * Math.cos(angle)
        const girdleZ1 = crownBaseRadius * Math.sin(angle)
        const girdleX2 = crownBaseRadius * Math.cos(nextAngle)
        const girdleZ2 = crownBaseRadius * Math.sin(nextAngle)
        
        // 定义形状
        starFacetShape.moveTo(tableX1, tableZ1)
        starFacetShape.lineTo(tableX2, tableZ2)
        starFacetShape.lineTo(girdleX2, girdleZ2)
        starFacetShape.lineTo(girdleX1, girdleZ1)
        starFacetShape.lineTo(tableX1, tableZ1)
        
        const starFacetGeometry = new THREE.ExtrudeGeometry(starFacetShape, {
          depth: 0.001,
          bevelEnabled: false
        })
        
        // 旋转和定位
        starFacetGeometry.rotateX(Math.PI / 2)
        starFacetGeometry.translate(0, crownHeight, 0)
        
        const starFacetMesh = new THREE.Mesh(starFacetGeometry, material)
        starFacetsGroup.add(starFacetMesh)
      }
      
      diamondGroup.add(starFacetsGroup)
      
      // 创建上部主面（从腰部到表面的面）
      const upperMainFacetsCount = 16 // 16个上部主面
      const upperMainFacetsGroup = new THREE.Group()
      
      for (let i = 0; i < upperMainFacetsCount; i++) {
        const angle = (i / upperMainFacetsCount) * Math.PI * 2
        const nextAngle = ((i + 1) / upperMainFacetsCount) * Math.PI * 2
        
        // 创建梯形面
        const vertices = [
          new THREE.Vector3(crownBaseRadius * Math.cos(angle), 0, crownBaseRadius * Math.sin(angle)),
          new THREE.Vector3(crownBaseRadius * Math.cos(nextAngle), 0, crownBaseRadius * Math.sin(nextAngle)),
          new THREE.Vector3(tableRadius * Math.cos(nextAngle), crownHeight, tableRadius * Math.sin(nextAngle)),
          new THREE.Vector3(tableRadius * Math.cos(angle), crownHeight, tableRadius * Math.sin(angle))
        ]
        
        const upperFacetGeometry = new THREE.BufferGeometry()
        const positions = new Float32Array(vertices.length * 3)
        
        for (let j = 0; j < vertices.length; j++) {
          positions[j * 3] = vertices[j].x
          positions[j * 3 + 1] = vertices[j].y
          positions[j * 3 + 2] = vertices[j].z
        }
        
        upperFacetGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        upperFacetGeometry.setIndex([0, 1, 2, 0, 2, 3])
        upperFacetGeometry.computeVertexNormals()
        
        const upperFacetMesh = new THREE.Mesh(upperFacetGeometry, material)
        upperMainFacetsGroup.add(upperFacetMesh)
      }
      
      diamondGroup.add(upperMainFacetsGroup)
      
      // 创建下部主面（从腰部到底尖的面）
      const lowerMainFacetsCount = 16 // 16个下部主面
      const lowerMainFacetsGroup = new THREE.Group()
      
      for (let i = 0; i < lowerMainFacetsCount; i++) {
        const angle = (i / lowerMainFacetsCount) * Math.PI * 2
        const nextAngle = ((i + 1) / lowerMainFacetsCount) * Math.PI * 2
        
        // 创建三角形面
        const vertices = [
          new THREE.Vector3(crownBaseRadius * Math.cos(angle), 0, crownBaseRadius * Math.sin(angle)),
          new THREE.Vector3(crownBaseRadius * Math.cos(nextAngle), 0, crownBaseRadius * Math.sin(nextAngle)),
          new THREE.Vector3(0, -pavilionHeight, 0) // 底尖
        ]
        
        const lowerFacetGeometry = new THREE.BufferGeometry()
        const positions = new Float32Array(vertices.length * 3)
        
        for (let j = 0; j < vertices.length; j++) {
          positions[j * 3] = vertices[j].x
          positions[j * 3 + 1] = vertices[j].y
          positions[j * 3 + 2] = vertices[j].z
        }
        
        lowerFacetGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        lowerFacetGeometry.setIndex([0, 1, 2])
        lowerFacetGeometry.computeVertexNormals()
        
        const lowerFacetMesh = new THREE.Mesh(lowerFacetGeometry, material)
        lowerMainFacetsGroup.add(lowerFacetMesh)
      }
      
      diamondGroup.add(lowerMainFacetsGroup)
      
      // 创建腰部（中间环）
      const girdleGeometry = new THREE.CylinderGeometry(crownBaseRadius, crownBaseRadius, 0.05, 32, 1)
      girdleGeometry.translate(0, -0.025, 0) // 稍微下移，使其位于冠部和亭部之间
      const girdleMaterial = new THREE.MeshPhysicalMaterial({
        ...material,
        roughness: 0.2 // 腰部稍微粗糙一些
      })
      const girdleMesh = new THREE.Mesh(girdleGeometry, girdleMaterial)
      diamondGroup.add(girdleMesh)
      
      return diamondGroup
    }
    
    // 创建钻石
    const diamond = createRealDiamond()
    scene.add(diamond)
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(2, 2, 5)
    scene.add(directionalLight)
    
    // 添加点光源模拟钻石的闪烁
    const brightnessValue = brightness / 100 // 将百分比转换为0-1的值
    
    // 创建多个点光源，增强闪烁效果
    const pointLight1 = new THREE.PointLight(0xffffff, brightnessValue * 5, 10)
    pointLight1.position.set(2, 1, 1)
    scene.add(pointLight1)
    
    const pointLight2 = new THREE.PointLight(0xffffff, brightnessValue * 4, 10)
    pointLight2.position.set(-2, -1, 1)
    scene.add(pointLight2)
    
    const pointLight3 = new THREE.PointLight(0xffffff, brightnessValue * 3, 10)
    pointLight3.position.set(0, 2, -2)
    scene.add(pointLight3)
    
    // 添加闪光效果
    const createSparkles = () => {
      const sparkleGroup = new THREE.Group()
      const sparkleCount = 8
      
      for (let i = 0; i < sparkleCount; i++) {
        const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8)
        const sparkleMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        })
        
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial)
        
        // 随机位置
        const angle = (i / sparkleCount) * Math.PI * 2
        const radius = 1.5
        sparkle.position.x = Math.cos(angle) * radius
        sparkle.position.y = Math.sin(angle) * radius * 0.5
        sparkle.position.z = (Math.random() - 0.5) * 2
        
        sparkleGroup.add(sparkle)
      }
      
      return sparkleGroup
    }
    
    const sparkles = createSparkles()
    scene.add(sparkles)
    
    // 添加光线效果
    const createLightRays = () => {
      const rayGroup = new THREE.Group()
      const rayCount = 6
      
      for (let i = 0; i < rayCount; i++) {
        const rayGeometry = new THREE.CylinderGeometry(0.02, 0.02, 3, 8)
        const rayMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3
        })
        
        const ray = new THREE.Mesh(rayGeometry, rayMaterial)
        
        // 随机位置和旋转
        const angle = (i / rayCount) * Math.PI * 2
        ray.position.x = Math.cos(angle) * 0.5
        ray.position.y = Math.sin(angle) * 0.5
        ray.rotation.z = angle
        ray.rotation.x = Math.PI / 2
        
        rayGroup.add(ray)
      }
      
      return rayGroup
    }
    
    const lightRays = createLightRays()
    scene.add(lightRays)
    
    // 调整钻石大小
    const scale = size / 300
    diamond.scale.set(scale, scale, scale)
    sparkles.scale.set(scale, scale, scale)
    lightRays.scale.set(scale, scale, scale)
    
    // 动画变量
    let time = 0
    let animationFrameId: number | null = null
    
    // 动画循环
    const animate = () => {
      time += 0.01
      
      // 更新控制器
      controls.update()
      
      // 钻石轻微浮动
      diamond.position.y = Math.sin(time * 0.5) * 0.05
      
      // 闪光动画
      sparkles.children.forEach((sparkle, i) => {
        const offset = i * 0.2
        sparkle.scale.setScalar(0.8 + Math.sin(time * 2 + offset) * 0.5)
        sparkle.material.opacity = 0.5 + Math.sin(time * 3 + offset) * 0.3
      })
      
      // 光线动画
      lightRays.children.forEach((ray, i) => {
        const offset = i * 0.3
        ray.scale.y = 1 + Math.sin(time * 1.5 + offset) * 0.3
        ray.material.opacity = 0.2 + Math.sin(time * 2 + offset) * 0.1
      })
      
      // 光源动画，让钻石看起来更闪亮
      pointLight1.intensity = brightnessValue * 5 + Math.sin(time * 1.5) * brightnessValue
      pointLight2.intensity = brightnessValue * 4 + Math.sin(time * 2) * brightnessValue
      pointLight3.intensity = brightnessValue * 3 + Math.sin(time * 2.5) * brightnessValue
      
      // 渲染场景
      renderer.render(scene, camera)
      
      // 继续动画循环
      animationFrameId = requestAnimationFrame(animate)
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
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize)
    
    // 开始动画
    animate()
    
    // 清理函数
    return () => {
      // 移除事件监听器
      window.removeEventListener('resize', handleResize)
      
      // 停止动画
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
      
      // 释放控制器
      controls.dispose()
      
      // 释放几何体和材质
      diamond.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
      
      sparkles.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
      
      lightRays.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
      
      // 从容器中移除渲染器的DOM元素
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      
      // 释放渲染器
      renderer.dispose()
    }
  }, [color, size, brightness, mounted])
  
  return (
    <div 
      ref={containerRef} 
      className={`diamond-detail-3d ${className}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '300px',
        position: 'relative'
      }}
    />
  )
}