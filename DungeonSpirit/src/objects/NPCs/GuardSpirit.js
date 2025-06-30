import * as THREE from 'three';
import { Spirit } from '../../skeletons/Spirit';

export class GuardSpirit extends Spirit {
    constructor(initPose = new THREE.Vector3(0, 10, 0), sphereColor = 0xff2222, fireMaterial1 = 0xff3300, fireMaterial2 = 0xff8800, fireMaterial3 = 0xffff00, isInteractable = true) {
        super(initPose, sphereColor, fireMaterial1, fireMaterial2, fireMaterial3);

        this.name = "Guard Spirit";
        this.position = "start_room";
        this.isInteractable = isInteractable;  
        this.firstInteraction = true;     
        this.hasKey = false;   
    }

    onInteract(player) {
        if(player.keyGiven){
            this.hasKey = true;
        }

    }

    onNPCInteract(resp) {
        if(this.firstInteraction){
            this.firstInteraction = false;
            if(this.hasKey){
                return "Oh... You didn't need me. Maybe I'm a waste of space in this game"
            }
            return "Hi lost spirit, if you want to leave, you have to talk to the purple spirit. "
        }else{
            if(this.hasKey){
                return "Hope you'll be happy after finish. ";
            }else{
                return "Do you want to stay here forever?";
            }
        }
        
    }
}