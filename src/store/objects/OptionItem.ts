import { BaseMxObject } from "./BaseMxObject";

export class OptionItem extends BaseMxObject {
    /**
     *
     * @param guid mxobj guid
     * @param idx option index
     */
    constructor(guid: string, public label: string) {
        super(guid);
    }
}
