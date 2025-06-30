import * as THREE from 'three';
import { Spirit } from '../../skeletons/Spirit';

export class PurpleSpirit extends Spirit {
    constructor(initPose = new THREE.Vector3(0, 10, 0), sphereColor = 0xff2222, fireMaterial1 = 0xff3300, fireMaterial2 = 0xff8800, fireMaterial3 = 0xffff00, isInteractable = true) {
        super(initPose, sphereColor, fireMaterial1, fireMaterial2, fireMaterial3);

        this.name = "Purple Spirit";
        this.position = "spirit_room";
        this.isInteractable = isInteractable; 
        this.keyData = {
            name: "Exit Key",
            description: "The key that unlocks the exit door.",
            quantity: 1,
            id: "2"
        }

        this.firstInteraction = false;
        this.firstInteractionAfterSword = true;
        this.swordGiven = false;
        
    }

    onInteract(player){
        const inventory = player.getInventory();
        //console.log(inventory.getAllItems());

        console.log(inventory);
        const key = inventory.hasItem("sword");
        if (key) {
            inventory.removeItem(key);
            inventory.addItem(this.keyData);
            player.keyGiven = true;
            //console.log(inventory.getAllItems());
            return true;
        } else {
            //console.log(inventory.getAllItems());
            return false;
        }
    }

    onNPCInteract(resp) {
        if(resp && this.firstInteraction){
            this.firstInteraction = false;
            this.swordGiven = true;
            return "How did you know I needed a sword? Anyway, take this key as a reward";
        }
        if(resp && this.firstInteractionAfterSword && !this.swordGiven){
            this.firstInteractionAfterSword = false;
            this.swordGiven = true;
            return "Thanks, take this key, I think you need it";
        }
        if(resp && !this.firstInteractionAfterSword && this.swordGiven){
            return "Go to the beginning, and you'll understand";
        }
        if(!resp && !this.firstInteraction && !this.swordGiven){
            this.firstInteraction = true;
            return "I need a sword, bring it to me and I will reward you";
        }
        if(resp && !this.swordGiven){
            this.swordGiven = true;
            return "Thank you for the sword, take this key as a reward";
        }
        if(!resp && this.firstInteraction){
            return "Maybe in some kind of treasures you can find a sword..."
        }
        if(this.swordGiven){
            return "I already gave you the key, go to the beginning and you'll understand";
        }
    }
}