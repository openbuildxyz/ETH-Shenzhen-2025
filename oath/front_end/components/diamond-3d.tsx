'use client'

import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface Diamond3DProps {
  color: string
  size: number
  brightness: number
  className?: string
  onClick?: () => void
}

export function Diamond3D({ color, size, brightness, className = '', onClick }: Diamond3DProps) {
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
      70, 
      1, // 宽高比将在下面设置
      0.1, 
      1000
    )
    camera.position.z = 2.5
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0) // 透明背景
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    
    // 设置相机宽高比
    camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
    camera.updateProjectionMatrix()
    
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
      
      // 创建表面
      const tableMesh = new THREE.Mesh(tableGeometry, material)
      diamondGroup.add(tableMesh)
      
      // 创建星形面（从表面到腰部的面）
      const starFacetsCount = 8 // 8个星形面
      const starFacetsGroup = new THREE.Group()
      
      for (let i = 0; i < starFacetsCount; i++) {
        const angle = (i / starFacetsCount) * Math.PI * 2
        const nextAngle = ((i + 1) / starFacetsCount) * Math.PI * 2
        
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
        starFacetsGroup.add(upperFacetMesh)
      }
      
      diamondGroup.add(starFacetsGroup)
      
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
    
    // 移除闪光效果
    
    // 调整钻石大小
    const scale = size / 200
    diamond.scale.set(scale, scale, scale)
    
    // 动画变量
    let time = 0
    let animationFrameId: number | null = null
    let mouseOver = false
    
    // 动画循环
    const animate = () => {
      time += 0.01
      
      // 旋转钻石
      if (!mouseOver) {
        diamond.rotation.y += 0.001 // 降低旋转速度
      }
      
      // 闪光动画已移除
      
      // 光源动画，让钻石看起来更闪亮
      pointLight1.intensity = brightnessValue * 5 + Math.sin(time * 1.5) * brightnessValue
      pointLight2.intensity = brightnessValue * 4 + Math.sin(time * 2) * brightnessValue
      
      // 渲染场景
      renderer.render(scene, camera)
      
      // 继续动画循环
      animationFrameId = requestAnimationFrame(animate)
    }
    
    // 鼠标交互事件
    const handleMouseOver = () => {
      mouseOver = true
      document.body.style.cursor = 'pointer'
      diamond.rotation.y += 0.1 // 稍微旋转一下，让用户知道它是可交互的
    }
    
    const handleMouseOut = () => {
      mouseOver = false
      document.body.style.cursor = 'default'
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
      
      // 释放几何体和材质
      diamond.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
      
      // 闪光效果已移除，不需要清理
      
      // 从容器中移除渲染器的DOM元素
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      
      // 释放渲染器
      renderer.dispose()
    }
  }, [color, size, brightness, onClick, mounted])
  
  return (
    <div 
      ref={containerRef} 
      className={`diamond-3d ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        position: 'relative'
      }}
    />
  )
}