import type { DockPosition, Position } from "@/types/canvas"

export type DockOrientation = "horizontal" | "vertical"

export type DockBounds = {
  width: number
  height: number
}

export type PhysicsConfig = {
  snapDistance: number
  centerSnapDistance: number
  centerBiasStrength: number
  edgePadding: number
  snapForceThreshold: number
}

export type SnapResult = {
  edge: DockPosition
  force: number
  edgeOffset: number
  orientation: DockOrientation
  isCentered: boolean
} | null

const DEFAULT_CONFIG: PhysicsConfig = {
  snapDistance: 100,
  centerSnapDistance: 60,
  centerBiasStrength: 0.8,
  edgePadding: 16,
  snapForceThreshold: 0.3,
}

export class DockPhysics {
  private config: PhysicsConfig

  constructor(config?: Partial<PhysicsConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  getOrientation(edge: DockPosition): DockOrientation {
    return edge === "left" || edge === "right" ? "vertical" : "horizontal"
  }

  calculateEdgeDistance(
    dockCenter: Position,
    dockBounds: DockBounds,
    edge: DockPosition,
    viewport: { width: number; height: number }
  ): number {
    const halfWidth = dockBounds.width / 2
    const halfHeight = dockBounds.height / 2

    switch (edge) {
      case "top":
        return dockCenter.y - halfHeight
      case "bottom":
        return viewport.height - (dockCenter.y + halfHeight)
      case "left":
        return dockCenter.x - halfWidth
      case "right":
        return viewport.width - (dockCenter.x + halfWidth)
    }
  }

  calculateCenterDistance(
    dockCenter: Position,
    edge: DockPosition,
    viewport: { width: number; height: number }
  ): number {
    const isHorizontalEdge = edge === "top" || edge === "bottom"

    if (isHorizontalEdge) {
      return Math.abs(dockCenter.x - viewport.width / 2)
    } else {
      return Math.abs(dockCenter.y - viewport.height / 2)
    }
  }

  isCentered(
    dockCenter: Position,
    edge: DockPosition,
    viewport: { width: number; height: number }
  ): boolean {
    const distance = this.calculateCenterDistance(dockCenter, edge, viewport)
    return distance < this.config.centerSnapDistance
  }

  calculateSnapForce(
    dockCenter: Position,
    dockBounds: DockBounds,
    edge: DockPosition,
    viewport: { width: number; height: number }
  ): number {
    const distance = this.calculateEdgeDistance(dockCenter, dockBounds, edge, viewport)

    if (distance >= this.config.snapDistance) return 0

    const clampedDistance = Math.max(0, distance)
    const normalizedDistance = clampedDistance / this.config.snapDistance
    const distanceForce = Math.pow(1 - normalizedDistance, 2)

    const centered = this.isCentered(dockCenter, edge, viewport)
    const biasMultiplier = centered ? 1 + this.config.centerBiasStrength : 1

    return Math.min(1, distanceForce * biasMultiplier)
  }

  calculateEdgeOffset(
    dockCenter: Position,
    edge: DockPosition,
    viewport: { width: number; height: number }
  ): number {
    const isHorizontalEdge = edge === "top" || edge === "bottom"

    if (isHorizontalEdge) {
      return Math.max(0.05, Math.min(0.95, dockCenter.x / viewport.width))
    } else {
      return Math.max(0.05, Math.min(0.95, dockCenter.y / viewport.height))
    }
  }

  calculateSnap(
    dockCenter: Position,
    dockBounds: DockBounds,
    viewport: { width: number; height: number }
  ): SnapResult {
    const edges: DockPosition[] = ["top", "bottom", "left", "right"]

    let strongest: { edge: DockPosition; force: number } | null = null

    for (const edge of edges) {
      const force = this.calculateSnapForce(dockCenter, dockBounds, edge, viewport)
      if (force > 0 && (!strongest || force > strongest.force)) {
        strongest = { edge, force }
      }
    }

    if (!strongest || strongest.force < this.config.snapForceThreshold) {
      return null
    }

    const centered = this.isCentered(dockCenter, strongest.edge, viewport)

    return {
      edge: strongest.edge,
      force: strongest.force,
      edgeOffset: centered ? 0.5 : this.calculateEdgeOffset(dockCenter, strongest.edge, viewport),
      orientation: this.getOrientation(strongest.edge),
      isCentered: centered,
    }
  }

  getConfig(): PhysicsConfig {
    return { ...this.config }
  }
}

export const dockPhysics = new DockPhysics()
