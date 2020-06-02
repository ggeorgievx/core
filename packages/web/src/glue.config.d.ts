/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "../web";
import { Glue42 } from "@glue42/desktop";

export interface Glue42CoreConfig {
  glue?: Glue42Web.Config;
  gateway?: any;
  channels?: Glue42.ChannelContext[];
}
