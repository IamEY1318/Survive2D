import P5 from "p5";
import { MapManager } from "../game/mapManager";
import { ESellingMenu, UIManager } from "../game/uiManager";
import { GameObject } from "../gameObjects/gameObject";
import { MovingObject } from "../movingObject";
import { ParticuleManager } from "../particules/particuleManager";
import { Player } from "../player/player";
import { PlayerManager } from "../player/playerManager";
import { Bullet } from "../player/tools/guns/bullets/bullet";
import { MalayTool } from "../player/tools/malayTool";
import { Tool } from "../player/tools/tool";
import { ETool, ToolManager } from "../player/tools/toolManager";
import { EEnemie, IEnemieData } from "./enemieManager";

export class Enemie extends MovingObject {
    private distToPlayer: number;
    constructor(
        x: number,
        y: number,
        public health: number,
        public fullHealth: number,
        private img: P5.Image,
        private enemieType: EEnemie,
        size: number,
        speed: number,
        public weapon: ETool,
        p5: P5,
        distToPlayer: number,
        private startHittingDist: number = 5
    ) {
        super(x, y, 0, size, speed, p5);
        ToolManager.createTool(weapon, this);
        this.distToPlayer = distToPlayer + PlayerManager.playerSize + size;
    }
    show() {
        const p5 = this.p5;
        p5.push();
        p5.translate(this.pos);
        p5.rotate(this.angle);
        p5.image(this.img, 0, 0, this.size * 2, this.size * 2);
        p5.pop();
        if(this.health < this.fullHealth) {
            this.showHealth();
        }
    }
    showHealth() {
        const p5 = this.p5;
        const scale = 2;
        p5.push();
        p5.translate(this.pos.x, this.pos.y - this.size * 1.5);
        p5.noStroke();
        p5.fill(80);
        p5.rect(0, 0, this.fullHealth / scale, 13);
        p5.fill(200, 50, 30);
        p5.rect(
            -(this.fullHealth / scale - this.health / scale) / 2,
            0,
            this.health / scale,
            13
        );

        p5.pop();
    }
    update() {
        const p5 = this.p5;
        const player = PlayerManager.player;
        const gameObjects = MapManager.gameObjects;
        let gameObjectsCollidedWith: GameObject[] = [];

        this.angle = p5.atan2(
            player.pos.y - this.pos.y,
            player.pos.x - this.pos.x
        );
        this.pos.x += this.vel.x;
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjectsCollidedWith = gameObjectsCollidedWith.concat(
                this.collide(gameObjects[i], {
                    x: this.p5.abs(this.vel.x) / this.vel.x,
                    y: 0,
                })
            );
        }
        this.pos.y += this.vel.y;
        for (let i = 0; i < gameObjects.length; i++) {
            gameObjectsCollidedWith = gameObjectsCollidedWith.concat(
                this.collide(gameObjects[i], {
                    x: 0,
                    y: this.p5.abs(this.vel.y) / this.vel.y,
                })
            );
        }
        this.boundries();
        const weapon = ToolManager.getWeapon(this) as Tool;
        if (gameObjectsCollidedWith.length > 0) {
            weapon.hit();
        }
    }
    takeDamage(attacker: Tool | Bullet) {
        let damage: number;
        if (attacker instanceof Tool) {
            const toolMalay = attacker as MalayTool;
            damage = toolMalay.damage.damage;
        } else {
            damage = attacker.damage;
        }
        ParticuleManager.showDamageEffect(this, Math.min(damage, this.health));
        this.health -= damage;
        if (this.health <= 0) {
            this.destroyed = true;
        }
    }
    follow(player: Player) {
        const p5 = this.p5;
        const dist = P5.Vector.dist(this.pos, player.pos);
        const distToStop = dist - this.distToPlayer;
        this.vel = p5.createVector(
            Math.cos(this.angle) * distToStop,
            Math.sin(this.angle) * distToStop
        );
        this.vel.setMag(p5.min(this.speed, p5.abs(distToStop)));
        if (dist < this.distToPlayer + this.startHittingDist) {
            const weapon = ToolManager.getWeapon(this) as Tool;
            weapon.hit();
        }
    }
    getEnemieData(): IEnemieData {
        return {
            x: this.pos.x,
            y: this.pos.y,
            health: this.health,
            type: this.enemieType
        }
    }
}
