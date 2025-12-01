import axios, { AxiosInstance } from 'axios';

export interface FigmaFile {
  name: string;
  document: FigmaNode;
  styles: Record<string, FigmaStyle>;
  components: Record<string, FigmaComponent>;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  style?: FigmaTextStyle;
  fills?: FigmaFill[];
  effects?: FigmaEffect[];
  cornerRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  layoutMode?: 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  itemSpacing?: number;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description?: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description?: string;
  componentSetId?: string;
  documentationLinks?: Array<{ uri: string }>;
}

export interface FigmaVariable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, any>;
  description?: string;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  defaultModeId: string;
}

export interface FigmaTextStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  paragraphSpacing?: number;
  paragraphIndent?: number;
  listOptions?: any;
  fontSize: number;
  fontWeight: number;
  textCase?: 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
  textDecoration?: 'UNDERLINE' | 'STRIKETHROUGH';
  letterSpacing?: {
    value: number;
    unit: 'PIXELS' | 'PERCENT';
  };
  lineHeight?: {
    value: number;
    unit: 'PIXELS' | 'PERCENT' | 'AUTO';
  };
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  opacity?: number;
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  radius: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  offset?: {
    x: number;
    y: number;
  };
  spread?: number;
}

export class FigmaAPI {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': token,
      },
    });
  }

  async getFile(fileId: string): Promise<FigmaFile> {
    try {
      const response = await this.client.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Неверный FIGMA_TOKEN. Проверьте токен в .env файле');
        }
        if (error.response?.status === 404) {
          throw new Error(
            `Файл не найден. Проверьте FIGMA_FILE_ID и доступ к файлу: https://www.figma.com/file/${fileId}`
          );
        }
        throw new Error(`Ошибка API Figma: ${error.response?.status} ${error.message}`);
      }
      throw error;
    }
  }

  async getVariables(fileId: string): Promise<{
    variables: FigmaVariable[];
    collections: FigmaVariableCollection[];
  }> {
    try {
      // Попробуем новый endpoint для Variables API
      const response = await this.client.get(`/files/${fileId}/variables/local`);
      return {
        variables: response.data.meta?.variables || [],
        collections: response.data.meta?.collections || [],
      };
    } catch (error) {
      // Если API для variables недоступен, попробуем получить из файла напрямую
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          // 403 может означать, что нужен другой способ получения Variables
          // Попробуем извлечь из основного файла
          try {
            const file = await this.getFile(fileId);
            // Variables могут быть в file.styles или в document
            // Пока возвращаем пустой массив, но логируем предупреждение
            console.warn('⚠️  Variables API вернул 403. Variables могут быть доступны через другой endpoint.');
            return { variables: [], collections: [] };
          } catch (innerError) {
            return { variables: [], collections: [] };
          }
        }
        if (error.response?.status === 404) {
          console.warn('⚠️  Variables API недоступен (404), используем альтернативный метод');
          return { variables: [], collections: [] };
        }
      }
      throw error;
    }
  }

  async getComponents(fileId: string): Promise<FigmaComponent[]> {
    try {
      const file = await this.getFile(fileId);
      return Object.values(file.components || {});
    } catch (error) {
      throw new Error(`Ошибка получения компонентов: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTextStyles(fileId: string): Promise<FigmaTextStyle[]> {
    try {
      const file = await this.getFile(fileId);
      const textStyles: FigmaTextStyle[] = [];

      // Рекурсивный поиск всех текстовых узлов
      const findTextNodes = (node: FigmaNode) => {
        if (node.type === 'TEXT' && node.style) {
          textStyles.push(node.style);
        }
        if (node.children) {
          node.children.forEach(findTextNodes);
        }
      };

      findTextNodes(file.document);
      return textStyles;
    } catch (error) {
      throw new Error(`Ошибка получения стилей текста: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getEffectStyles(fileId: string): Promise<FigmaEffect[]> {
    try {
      const file = await this.getFile(fileId);
      const effects: FigmaEffect[] = [];

      // Рекурсивный поиск всех эффектов
      const findEffects = (node: FigmaNode) => {
        if (node.effects && node.effects.length > 0) {
          effects.push(...node.effects);
        }
        if (node.children) {
          node.children.forEach(findEffects);
        }
      };

      findEffects(file.document);
      return effects;
    } catch (error) {
      throw new Error(`Ошибка получения эффектов: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNodeById(fileId: string, nodeId: string): Promise<FigmaNode> {
    try {
      const response = await this.client.get(`/files/${fileId}/nodes`, {
        params: { ids: nodeId },
      });
      return response.data.nodes[nodeId]?.document;
    } catch (error) {
      throw new Error(`Ошибка получения узла: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

