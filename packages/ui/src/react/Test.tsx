export type TestComponentProps = {
  input: string
}

export const TestComponent = ({ input }: TestComponentProps) => {
  return (
    <strong>{input}</strong>
  )
}
