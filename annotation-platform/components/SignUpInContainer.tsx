import { Banner } from "./Banner.tsx";

export function SignUpInContainer() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Banner />
      <div className="space-y-4">
        <a
          href="/auth/signin"
          className="w-64 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in
        </a>
        <a
          href="/auth/signup"
          className="w-64 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Sign up
        </a>
      </div>
    </div>
  );
}
