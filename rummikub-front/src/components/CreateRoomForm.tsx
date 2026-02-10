import { Form } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputFormField from '@/components/form/InputFormField';
import { useCreateRoomForm } from '@/hooks/useCreateRoomForm';

function CreateRoomForm() {
  const { form, onSubmit } = useCreateRoomForm();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>방 만들기</CardTitle>
        <CardDescription>새로운 루미큐브 방을 만들어보세요.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form className="flex flex-col gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <InputFormField
              control={form.control}
              name="nickname"
              label="닉네임"
              placeholder="닉네임을 입력해주세요 (2~20자)"
              maxLength={20}
            />
            {form.formState.errors.root && (
              <p className="text-destructive text-sm mt-2">{form.formState.errors.root.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              방 만들기
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default CreateRoomForm;
