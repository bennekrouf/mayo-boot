import xcode from 'xcode';
import fs from 'fs';

export const addGoogleServiceInfoIfNotExists = (): void => {
    const projectPath = 'Your/Project/Path/YourProject.xcodeproj/project.pbxproj';
    const project = xcode.project(projectPath);

    project.parse((err:any) => {
        if (err) {
            console.error(err);
            return;
        }

        // Path to your GoogleService-Info.plist file.
        const plistFilePath = 'Path/To/Your/GoogleService-Info.plist';
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