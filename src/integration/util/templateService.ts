import { promises as fs } from "fs";
import path from "path";
import ejs from "ejs";
import { createIntegrationLogger } from "../../utils/logger";

export interface TemplateData {
  integrationId: string;
  displayName: string;
  targetFile: string;
  createdAt: string;
}

export class TemplateService {
  private templateDir: string;
  private logger: ReturnType<typeof createIntegrationLogger>;

  constructor(
    templateDir: string = path.join(process.cwd(), "templates", "integration"),
    integrationId?: string,
  ) {
    this.templateDir = templateDir;
    this.logger = createIntegrationLogger(integrationId || "template-service");
  }

  async renderTemplate(
    templatePath: string,
    data: TemplateData,
  ): Promise<string> {
    try {
      const templateContent = await fs.readFile(templatePath, "utf-8");
      return ejs.render(templateContent, data);
    } catch (error) {
      this.logger.error("Failed to render template", { templatePath, error });
      throw new Error(`Failed to render template ${templatePath}: ${error}`);
    }
  }

  async copyTemplateToDestination(
    templatePath: string,
    destinationPath: string,
    data: TemplateData,
  ): Promise<void> {
    const renderedContent = await this.renderTemplate(templatePath, data);
    await fs.writeFile(destinationPath, renderedContent);
    this.logger.debug("Template copied successfully", {
      templatePath,
      destinationPath,
    });
  }

  async copyAllTemplates(
    destinationDir: string,
    data: TemplateData,
  ): Promise<void> {
    try {
      this.logger.info("Starting template copy process", {
        destinationDir,
        templateDir: this.templateDir,
      });
      await this.copyDirectoryRecursive(this.templateDir, destinationDir, data);
      this.logger.info("Template copy process completed successfully", {
        destinationDir,
      });
    } catch (error) {
      this.logger.error("Failed to copy templates", { destinationDir, error });
      throw new Error(`Failed to copy templates: ${error}`);
    }
  }

  private async copyDirectoryRecursive(
    sourceDir: string,
    destinationDir: string,
    data: TemplateData,
  ): Promise<void> {
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(sourceDir, entry.name);
      const destinationPath = path.join(destinationDir, entry.name);

      if (entry.isDirectory()) {
        // Create directory and recurse
        await fs.mkdir(destinationPath, { recursive: true });
        this.logger.debug("Created directory", { directory: destinationPath });
        await this.copyDirectoryRecursive(sourcePath, destinationPath, data);
      } else {
        // Copy file with template processing if it's an .ejs file
        if (entry.name.endsWith(".ejs")) {
          const finalDestinationPath = destinationPath.replace(/\.ejs$/, "");
          await this.copyTemplateToDestination(
            sourcePath,
            finalDestinationPath,
            data,
          );
        } else {
          // Copy file as-is (binary files, etc.)
          await fs.copyFile(sourcePath, destinationPath);
          this.logger.debug("Copied binary file", {
            source: sourcePath,
            destination: destinationPath,
          });
        }
      }
    }
  }

  async getAvailableTemplates(): Promise<string[]> {
    try {
      const files: string[] = [];
      await this.collectFilesRecursive(this.templateDir, files);
      this.logger.debug("Retrieved available templates", {
        count: files.length,
      });
      return files;
    } catch (error) {
      this.logger.error("Failed to read template directory", {
        templateDir: this.templateDir,
        error,
      });
      return [];
    }
  }

  private async collectFilesRecursive(
    dir: string,
    files: string[],
  ): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await this.collectFilesRecursive(fullPath, files);
      } else {
        files.push(fullPath);
      }
    }
  }
}
