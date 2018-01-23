import EquipmentAttribute from './EquipmentAttribute'
import Equipment from './Equipment'

export default class EquipmentAttributeInstance {
    id: number;
    equipment: Equipment;
    attribute: EquipmentAttribute;
    value: string;
    modified: Date;
}