export default class EquipmentAttribute {
    id: number;
    name: string;
    regex: RegExp;
    required: boolean;
    unique: boolean;
    public: boolean;
    helpText: string;
}