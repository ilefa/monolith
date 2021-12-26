import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'levels' } })
export class LevelBundle {

    @prop({ required: true })
    public userId: string;

    @prop({ required: true })
    public level: number;

    @prop({ required: true })
    public xp: number;

    @prop({ required: true })
    public totalXp: number;

    @prop({ required: true })
    public messages: number;

}