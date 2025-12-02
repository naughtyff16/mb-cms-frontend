import * as Yup from 'yup'

export interface AuthFormValues {
    account: string
    username: string
    password: string
}

export const schema = Yup.object().shape({
    account: Yup.string()
        .trim()
        .required('User Name Required'),
        username: Yup.string()
        .trim()
        .required('Email Required'),
    password: Yup.string().trim()
        .required('Password Required'),
})