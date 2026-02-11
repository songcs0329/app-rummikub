import { Form } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InputFormField from '@/components/form/InputFormField';
import { useJoinRoomForm } from '@/hooks/useJoinRoomForm';

interface JoinRoomFormProps {
  roomCode?: string;
}

function JoinRoomForm({ roomCode }: JoinRoomFormProps) {
  const { form, onSubmit } = useJoinRoomForm(roomCode);

  return (
    <Card className="w-full h-full max-w-md border-0 shadow-none rounded-none">
      <CardHeader>
        <CardTitle>방 참여하기</CardTitle>
        <CardDescription>방 코드를 입력하여 루미큐브 방에 참여하세요.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form className="flex-1 justify-between flex flex-col gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <InputFormField
              control={form.control}
              name="roomCode"
              label="방 코드"
              placeholder="6자리 방 코드를 입력해주세요"
              maxLength={6}
            />
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
            <Button type="submit" size="lg" className="w-full">
              방 참여하기
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default JoinRoomForm;
