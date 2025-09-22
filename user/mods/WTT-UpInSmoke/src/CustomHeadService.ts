/* eslint-disable @typescript-eslint/naming-convention */
import type { ICustomizationItem } from "@spt/models/eft/common/tables/ICustomizationItem";
import type { WTTInstanceManager } from "./WTTInstanceManager";
import fs from "node:fs";
import path from "node:path";
import type { HeadConfig } from "./references/configConsts";
import { CustomisationSource, CustomisationType } from "@spt/models/eft/common/tables/ICustomisationStorage";

export class CustomHeadService 
{
    private instanceManager: WTTInstanceManager;

    public preSptLoad(instanceManager: WTTInstanceManager): void 
    {
        this.instanceManager = instanceManager;
    }

    public postDBLoad(): void 
    {
        const headsJsonPath = path.join(__dirname, "../db/heads");

        const configFiles = fs
            .readdirSync(headsJsonPath)
    
    
        for (const file of configFiles) {
            const filePath = path.join(headsJsonPath, file);
    
            try {
                const fileContents = fs.readFileSync(filePath, "utf-8");
                const config = JSON.parse(fileContents);
    
                for (const headId in config) {
                    const headConfig: HeadConfig = config[headId];
                    this.processHeadConfigs(headId, headConfig);
                }
            }
            catch (error) {
                console.log(error);
            }
        }


    }

    private processHeadConfigs(headId: string, headConfig: HeadConfig) 
    {
        const iCustomizationHead = this.generateHeadSpecificConfig(headId, headConfig);

        const addHeadToPlayer = headConfig.addHeadToPlayer;
        this.addHeadToTemplates(headId, iCustomizationHead, addHeadToPlayer);
        this.addHeadToCustomizationStorage(headId);
        this.addHeadLocale(headConfig, headId);
    }

    private generateHeadSpecificConfig(headId: string, headConfig: HeadConfig): ICustomizationItem 
    {
        return {
            _id: headId,
            _name: null,
            _parent: "5cc085e214c02e000c6bea67",
            _type: "Item",
            _props: {
                AvailableAsDefault: true,
                Name: null,
                ShortName: null,
                Description: null,
                Side: headConfig.side,
                BodyPart: "Head",
                IntegratedArmorVest: false,
                ProfileVersions: [],
                Prefab: {
                    path: headConfig.path,
                    rcid: ""
                    },
                WatchPrefab: {
                    path: "",
                    rcid: ""
                    },
                WatchPosition: {
                    x: 0,
                    y: 0,
                    z: 0
                    },
                WatchRotation: {
                    x: 0,
                    y: 0,
                    z: 0
                    }
            },
            _proto: "5cc2e4d014c02e000d0115f8"
        };
    }

    private addHeadToCustomizationStorage(headId: string)
    {
        const customizationStorage = this.instanceManager.database.templates.customisationStorage;

        const headStorage = {
            "id": headId,
            "source": CustomisationSource.DEFAULT,
            "type": CustomisationType.HEAD
        }

        customizationStorage.push(headStorage);
    }
    private addHeadToTemplates(
        headId: string,
        iCustomizationHead: ICustomizationItem,
        addHeadToPlayer: boolean
    ) 
    {
        const templates = this.instanceManager.database.templates;
        templates.customization[headId] = iCustomizationHead as ICustomizationItem;
        
        if (addHeadToPlayer) 
        {
            templates.character.push(headId);
        }
    }

    private addHeadLocale(headConfig: HeadConfig, headId: string) 
    {
        const globalLocales = this.instanceManager.database.locales.global;

        for (const locale of Object.values(globalLocales)) 
        {
            for (const key in locale) 
            {
                if (headConfig.locales[key])
                {
                    const headLocaleKey = `${headId} Name`;
                    locale[headLocaleKey] = headConfig.locales[key];
                }
            }
        }
    }
}
