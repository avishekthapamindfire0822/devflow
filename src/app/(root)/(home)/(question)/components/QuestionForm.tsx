'use client';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';
import {
  QuestionSchema,
  QuestionSchemaDefinition,
} from '@app/(root)/validation/question-schema';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app/(root)/components/ui/form';

import { ASK_QUESTION_FORM_FIELDS } from '@app/(root)/constants/form';

import { createQuestion } from '../action';
import { useRouter } from 'next/navigation';
import tryCatchWrapper from '@app/(root)/utils/try-catch-util';
import { Question } from '@src/app/(root)/types';
import FormInput from '../../shared/components/FormInput';
import RenderTag from '../../shared/components/RenderTag';
import Tag from '../../shared/components/Tag';
import BaseForm from '../../shared/components/BaseForm';
import MarkupEditor from '../../shared/components/MarkupEditor';

export default function QuestionForm() {
  const router = useRouter();
  const onSubmit = async (data: QuestionSchemaDefinition) => {
    await tryCatchWrapper(async () => {
      const { explanation, title, tags } = data;
      const questDto: Question = {
        explanation,
        title,
        tags,
      };
      const { error, data: userId } = await createQuestion(questDto);
      if (userId) {
        router.replace('/');
      }
      console.log({ error });
    });
  };

  const addTag = (
    tag: string,
    form: UseFormReturn<zod.infer<typeof QuestionSchema>>,
  ) => {
    const previousTags = form.getValues('tags');
    form.setValue('tags', [...previousTags, { name: tag }]);
  };

  const removeTag = (
    tag: string,
    form: UseFormReturn<zod.infer<typeof QuestionSchema>>,
  ) => {
    const previousTags = form.getValues('tags');
    const filteredTags = previousTags.filter(
      (previousTag) => previousTag.name !== tag,
    );
    form.setValue('tags', filteredTags);
  };
  const handleInputKeyDown = (
    keyEvent: React.KeyboardEvent<HTMLInputElement>,
    field: HTMLInputElement,
    form: UseFormReturn<QuestionSchemaDefinition>,
  ) => {
    if (keyEvent.key === 'Enter') {
      keyEvent.preventDefault();
      const tag = field.value;
      if (tag.length > 15) {
        form.setError('tags', {
          message: 'Tag cannot contain more than 15 characters.',
        });
        return;
      }
      const previousTags = form.getValues('tags');
      if (previousTags.length === 3) {
        form.setError('tags', {
          message: 'Cannot add more than 3 tags.',
        });
        return;
      }
      const tagExits = previousTags.find(({ name }) => name === tag);
      if (!tagExits) {
        addTag(tag, form);
        field.value = '';
      }
      form.clearErrors('tags');
    }
  };
  return (
    <BaseForm<QuestionSchemaDefinition>
      onSubmit={onSubmit}
      options={{
        resolver: zodResolver(QuestionSchema),
        defaultValues: {
          title: '',
          tags: [],
          explanation: '',
        },
      }}
      renderFields={(form) => {
        return (
          <>
            {ASK_QUESTION_FORM_FIELDS.map(
              ({ id, description, label, name, type, placeholder }) => {
                return (
                  <FormField
                    key={id}
                    control={form.control}
                    name={name as keyof zod.infer<typeof QuestionSchema>}
                    render={({ field }) => (
                      <>
                        <FormItem className='flex w-full flex-col'>
                          <FormLabel className='paragraph-semibold text-dark400_light800 capitalize'>
                            {label}
                            <span className='text-primary-500'> *</span>
                          </FormLabel>
                          <FormControl className='mt-4'>
                            <FormInput
                              {...(name === 'tags'
                                ? { ref: field.ref }
                                : { ...field, value: field.value as string })}
                              type={type}
                              placeholder={placeholder}
                              disabled={form.formState.isSubmitting}
                              {...(name === 'tags'
                                ? {
                                    onKeyDown: (e) => {
                                      const inputElement =
                                        e.target as HTMLInputElement;
                                      handleInputKeyDown(e, inputElement, form);
                                    },
                                  }
                                : {})}
                            />
                          </FormControl>
                          <FormDescription>{description}</FormDescription>
                          <FormMessage className='text-red-500' />
                          {field.name === 'tags' &&
                          Array.isArray(field.value) &&
                          field.value.length > 0 ? (
                            <RenderTag>
                              {field.value.map(({ name }) => {
                                return (
                                  <Tag
                                    key={name}
                                    tag={name}
                                    className='flex items-center justify-between gap-2 py-2 text-xs'
                                    iconUrl='/assets/icons/close.svg'
                                    iconAlt='close icon'
                                    onIconClick={() => removeTag(name, form)}
                                  />
                                );
                              })}
                            </RenderTag>
                          ) : null}
                        </FormItem>
                      </>
                    )}
                  />
                );
              },
            )}
            <FormField
              control={form.control}
              name='explanation'
              render={({ field }) => (
                <FormItem className='flex w-full flex-col'>
                  <FormLabel className='paragraph-semibold text-dark400_light800 capitalize'>
                    Description
                    <span className='text-primary-500'> *</span>
                  </FormLabel>
                  <FormControl className='mt-4'>
                    <MarkupEditor
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className='text-red-500' />
                </FormItem>
              )}
            />
          </>
        );
      }}
    />
  );
}