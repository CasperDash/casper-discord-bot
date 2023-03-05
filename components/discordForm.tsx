import { useAccount, useSignMessage } from "@casperdash/usewallet";
import { useForm } from "react-hook-form";
import { setCookie } from "cookies-next";

type FormValues = {
  walletAddress: string;
  amount: number;
};

const DiscordForm = ({ url, pk }) => {
  const { signMessage, data } = useSignMessage({
    onSuccess: (mess, params) => {
      setCookie("signature", mess, {
        maxAge: 1000 * 60 * 5,
      });

      setCookie("address", pk, {
        maxAge: 1000 * 60 * 5,
      });
    },
  });
  const { register, handleSubmit } = useForm({
    defaultValues: {
      walletAddress: "",
      amount: 0,
    },
  });

  const onSubmit = (formValues: FormValues) => {
    signMessage({
      message: `link-discord-${pk}`,
      signingPublicKeyHex: pk,
    });
  };

  return (
    <div>
      {data ? (
        <a href={`${url}&signature=${data}`}>Link to Discord</a>
      ) : (
        <form className="singer-form" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" />
          <button type="submit">Sign Message</button>
        </form>
      )}
    </div>
  );
};

export default DiscordForm;
