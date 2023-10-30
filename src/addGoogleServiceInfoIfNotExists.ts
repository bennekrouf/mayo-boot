import xcode from 'xcode';
import fs from 'fs';
import path from 'path';

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
        console.error('Could not find an Xcode project in the ios directory.');
        return;
    }

    const project = xcode.project(projectPath);

    project.parse((err:any) => {
        if (err) {
            console.error(err);
            return;
        }

        // Path to your GoogleService-Info.plist file.
        const plistFilePath = 'ios/GoogleService-Info.plist';
        if (!fs.existsSync(plistFilePath)) {
            console.error('File does not exist:', plistFilePath);
            return;
        }

        // Check if the file is already in the project
        if (project.hasResource(plistFilePath)) {
            console.log('GoogleService-Info.plist is already in the Xcode project.');
            return;
        }

        // Add file to the project
        project.addResourceFile(plistFilePath);

        // Save the changes back to Xcode project file.
        fs.writeFileSync(projectPath, project.writeSync());

        console.log('Added GoogleService-Info.plist to the Xcode project.');
    });
}