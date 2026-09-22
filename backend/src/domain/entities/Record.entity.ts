export interface RecordEntityProps {
  id?: string;
  title: string;
  description?: string;
  createdAt?: Date | string;
}

export class RecordEntity {
  public readonly id?: string;
  public readonly title: string;
  public readonly description: string;
  public readonly createdAt: Date;

  constructor(props: RecordEntityProps) {
    if (!props.title || typeof props.title !== 'string' || !props.title.trim()) {
      throw new Error('Record title is required');
    }
    this.id = props.id;
    this.title = props.title.trim();
    this.description = props.description ? props.description.trim() : '';
    this.createdAt = props.createdAt instanceof Date ? props.createdAt : new Date(props.createdAt || Date.now());
  }

  toWire() {
    return {
      id: this.id ? String(this.id) : '',
      title: this.title,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export default RecordEntity;
