import { DetailField} from "../models/details.interface";

export function setDetail(config: Partial<DetailField>): DetailField {

  return {
    key: config.key || '',
    label: config.label || config.key || '',
    type: config.type || 'text',
    value: config.value ?? null,
    options: config.options || [],
    children: config.children || [],
    readonly: config.readonly ?? null,
    required: config.required ?? true,
    hidden: config.hidden ?? false,
    disabled: config.disabled ?? false,
    placeholder: config.placeholder || '',
    maxlength: config.maxlength || 250,
    fullwidth: config.fullwidth || false
  };

}