import { Glue42Web } from "../web";

export const addNewChannel = (glue: Glue42Web.API, channelNameAndColor: string, data?: object): Promise<Glue42Web.ChannelContext> => {
    const info = {
        name: channelNameAndColor,
        meta: {
            color: channelNameAndColor
        },
        data: data || {}
    };

    return glue.channels.add(info);
};
