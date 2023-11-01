import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

export const checkMissingiOSResources = (): void => {
    const XCODEPROJ_DIR: string | undefined = execSync('find ios -name "*.xcodeproj" -type d | head -1', { encoding: 'utf-8' }).trim();
    const PBXPROJ_PATH = `${XCODEPROJ_DIR}/project.pbxproj`;

    if (fs.existsSync(PBXPROJ_PATH)) {
        const RESOURCE_PATHS: string[] = execSync(`grep -E '"\\w{24}\\W*/\\*\\W(.*)in resources\\W\\*/",' ${PBXPROJ_PATH} | sed -E 's/.*\\W\\*\\W(.*)in resources\\W\\*/\\1/'`, { encoding: 'utf-8' })
            .split('\n')
            .filter(Boolean);

        for (const resource of RESOURCE_PATHS) {
            const resourcePath = path.join(XCODEPROJ_DIR, resource);
            if (!fs.existsSync(resourcePath)) {
                console.error(`Missing: ${resourcePath}`);
            }
        }
    } else {
        console.error(`Unable to locate: ${PBXPROJ_PATH}`);
    }
};
