import xcode from 'xcode';
import fs from 'fs';
import path from 'path';
import { Logger } from 'mayo-logger'; // Make sure to import Logger from mayo-logger

const getProjectPath = (): string | null => {
    const iosDir = path.join(process.cwd(), 'ios');
    const xcodeProjects = fs.readdirSync(iosDir).filter(name => name.endsWith('.xcodeproj'));

    if (xcodeProjects.length === 0) {
        return null;
    }

    return path.join(iosDir, xcodeProjects[0], 'project.pbxproj');
};

export const addGoogleServiceInfoIfNotExists = (): void => {
    const projectPath = getProjectPath();

    if (!projectPath) {
        Logger.error('Could not find an Xcode project in the ios directory.', { tag: 'addGoogleServiceInfo' });
        return;
    }

    const project = xcode.project(projectPath);

    project.parse((err: any) => {
        if (err) {
            Logger.error(err, { tag: 'addGoogleServiceInfo' });
            return;
        }

        // Path to your GoogleService-Info.plist file.
        const plistFilePath = 'ios/GoogleService-Info.plist';
        if (!fs.existsSync(plistFilePath)) {
            Logger.error('File does not exist: ' + plistFilePath, { tag: 'addGoogleServiceInfo' });
            return;
        }

        // Check if the file is already in the project
        if (project.hasResource(plistFilePath)) {
            Logger.info('GoogleService-Info.plist is already in the Xcode project.', { tag: 'addGoogleServiceInfo' });
            return;
        }

        // Add file to the project
        project.addResourceFile(plistFilePath);

        // Save the changes back to Xcode project file.
        fs.writeFileSync(projectPath, project.writeSync());

        // Verification
        const projectContents = fs.readFileSync(projectPath, 'utf-8');
        if (projectContents.includes(plistFilePath)) {
            Logger.info('Verification successful: GoogleService-Info.plist has been added to the Xcode project.', { tag: 'addGoogleServiceInfo' });
        } else {
            Logger.error('Verification failed: GoogleService-Info.plist could not be found in the Xcode project.', { tag: 'addGoogleServiceInfo' });
        }
    });
};
