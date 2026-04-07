import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function Icon3D({ type = 'coin', size = 100 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const width = size
    const height = size

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    let geometry, material, mesh

    if (type === 'coin') {
      geometry = new THREE.CylinderGeometry(1, 1, 0.2, 32)
      material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2
      })
      mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = Math.PI / 6
    } else if (type === 'bomb') {
      geometry = new THREE.SphereGeometry(0.8, 32, 32)
      material = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.4,
        roughness: 0.6
      })
      mesh = new THREE.Mesh(geometry, material)

      const fuseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8)
      const fuseMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial)
      fuse.position.y = 1
      mesh.add(fuse)
    } else if (type === 'lightning') {
      const group = new THREE.Group()

      for (let i = 0; i < 3; i++) {
        const boltGeometry = new THREE.BoxGeometry(0.1, 1.5, 0.1)
        const boltMaterial = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.5
        })
        const bolt = new THREE.Mesh(boltGeometry, boltMaterial)
        bolt.position.x = (i - 1) * 0.3
        bolt.rotation.z = (Math.random() - 0.5) * 0.3
        group.add(bolt)
      }

      mesh = group
    }

    if (mesh) {
      scene.add(mesh)
    }

    const light1 = new THREE.DirectionalLight(0xffffff, 1)
    light1.position.set(5, 5, 5)
    scene.add(light1)

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5)
    light2.position.set(-5, -5, 5)
    scene.add(light2)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (mesh && mesh instanceof THREE.Group) {
        mesh.rotation.y += 0.01
      } else if (mesh) {
        mesh.rotation.z += 0.005
        mesh.rotation.x += 0.003
      }

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      containerRef.current?.removeChild(renderer.domElement)
      geometry?.dispose()
      material?.dispose()
      renderer.dispose()
    }
  }, [type, size])

  return <div ref={containerRef} style={{ width: size, height: size }} />
}

export default Icon3D
