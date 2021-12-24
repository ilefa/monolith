import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'roles' } })
export class SelfAssignableRoleBundle {

    @prop({ required: true })
    roleId: string;

    @prop({ required: true })
    displayName: string;

    @prop({ required: true })
    emote: string;

}