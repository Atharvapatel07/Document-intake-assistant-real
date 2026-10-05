import { z } from "zod";

export const ChildSchema = z.object({
  name: z.string().trim().min(1)
});

export const ExecutorSchema = z.object({
  name: z.string().trim().min(1).nullable(),
  relationship: z.string().trim().min(1).nullable()
});

export const IntakeStateSchema = z.object({
  full_name: z.string().trim().min(1).nullable(),
  home_address: z.string().trim().min(1).nullable(),
  covers_worldwide_assets: z.boolean().nullable(),
  has_children: z.boolean().nullable(),
  children: z.array(ChildSchema).nullable(),
  executor: ExecutorSchema,
  specific_gifts: z.array(z.string().trim().min(1)).nullable(),
  additional_wishes: z.string().trim().min(1).nullable()
});

export const IntakePatchSchema = z
  .object({
    full_name: z.string().trim().min(1).nullable().optional(),
    home_address: z.string().trim().min(1).nullable().optional(),
    covers_worldwide_assets: z.boolean().nullable().optional(),
    has_children: z.boolean().nullable().optional(),
    children: z.array(ChildSchema).nullable().optional(),
    executor: ExecutorSchema.partial().optional(),
    specific_gifts: z.array(z.string().trim().min(1)).nullable().optional(),
    additional_wishes: z.string().trim().min(1).nullable().optional()
  })
  .strict();

export const ModelExtractionSchema = z
  .object({
    state_patch: IntakePatchSchema,
    assistant_message: z.string().trim().min(1),
    needs_clarification: z.boolean(),
    warnings: z.array(z.string().trim().min(1))
  })
  .strict();

export const ChatMessageSchema = z.object({
  role: z.enum(["assistant", "user"]),
  content: z.string().trim().min(1),
  created_at: z.string().datetime()
});

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1)
});

export const CorrectionRequestSchema = IntakePatchSchema;

export type Child = z.infer<typeof ChildSchema>;
export type Executor = z.infer<typeof ExecutorSchema>;
export type IntakeState = z.infer<typeof IntakeStateSchema>;
export type IntakePatch = z.infer<typeof IntakePatchSchema>;
export type ModelExtraction = z.infer<typeof ModelExtractionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const emptyIntakeState: IntakeState = {
  full_name: null,
  home_address: null,
  covers_worldwide_assets: null,
  has_children: null,
  children: null,
  executor: {
    name: null,
    relationship: null
  },
  specific_gifts: null,
  additional_wishes: null
};
