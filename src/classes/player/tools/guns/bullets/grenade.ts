import P5 from "p5";
import { EnemieManager } from "../../../../enemies/enemieManager";
import { MapManager } from "../../../../game/mapManager";
import { ParticuleManager } from "../../../../particules/particuleManager";
import { Utils } from "../../../../utils";
import { Bullet } from "./bullet";

export class Grenade extends Bullet {
    public explosionRange = 30;
    public explosionDamage = 25;

    constructor(x: number, y: number, angle: number, p5: P5) {
        super(x, y, 10, 5, angle, 500, 8, 0, p5);
    }
    onDeath() {
        const enemies = EnemieManager.enemies;
        for (const enemie of enemies) {
            if (
                Utils.dist(enemie.pos.x, enemie.pos.y, this.pos.x, this.pos.y) <
                this.explosionRange + enemie.size
            ) {
                enemie.takeDamage(this.explosionDamage);
            }
        }
        ParticuleManager.showExplosionEffect(this.pos.x, this.pos.y, this.explosionRange, this.p5);
    }
}
