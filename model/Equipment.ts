import EquipmentType from './EquipmentType'
import EquipmentAttributeInstance from './EquipmentAttributeInstance'

export default class Equipment {
    id: number;
    type: EquipmentType;
    attributes: EquipmentAttributeInstance[];
    created: Date;
}