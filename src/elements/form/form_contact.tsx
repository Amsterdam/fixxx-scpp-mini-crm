import { Card, CardContent, FormTitle, Label, Input, Button } from '@amsterdam/asc-ui'
import React from 'react'
import ContactService, { Contact } from '../../shared/service_contact'
import { School } from '../../shared/service_school'
import './form.scss'
import { FormErrors } from './form_errors'

type ContactFormState = {
    nameValid: Boolean,
    phoneValid: Boolean,
    formValid: Boolean,
    school: School | any,
    name: string,
    email: string,
    phone: string,
    formErrors: { email: string, phone: string, name: string }
}

export class ContactForm extends React.Component<{}> {
    readonly state: ContactFormState = {
        school: {},
        nameValid: false,
        phoneValid: false,
        formValid: false,
        name: "",
        email: "",
        phone: "",
        formErrors: { email: '', phone: '', name: '' },
    }

    contactService: ContactService
    school: any
    constructor(props: any) {
        super(props)
        this.school = React.createRef()
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleUserInput = this.handleUserInput.bind(this)
        this.contactService = new ContactService()
    }

    handleSubmit = (event: any) => {
        const postContact: Contact = {
            id: 0,
            name: this.state.name,
            email: this.state.email,
            phone: this.state.phone,
        }    

        this.contactService.postContact(postContact).then((result: Contact) => {})
        event.preventDefault()
    }

    validateForm() {
        this.setState({ formValid: this.state.nameValid && this.state.phoneValid });
    }

    handleUserInput(e: any) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({ [name]: value },
            () => {
                this.validateField(name, value)
            }
        )
    }

    validateField(fieldName: string, value: any) {
        let fieldValidationErrors = this.state.formErrors
        let phoneValid = this.state.phoneValid
        let nameValid = this.state.nameValid

        switch (fieldName) {
            // case 'email':
            //     emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
            //     fieldValidationErrors.email = emailValid ? '' : 'Email is ongeldig'
            //     break
            case 'name':
                nameValid = value.length >= 6
                fieldValidationErrors.name = nameValid ? '' : 'Naam is te kort'
                break
            case 'phone':
                phoneValid = value.match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s/0-9]*$/g)
                fieldValidationErrors.phone = phoneValid ? '' : 'Telefoonnummer bevat ongeldige tekens'
                break
            default:
                break
        }

        this.setState({
            formErrors: fieldValidationErrors,
            nameValid: nameValid,
            phoneValid: phoneValid,
        }, this.validateForm);
    }

    errorClass(error: string) {
        return (error.length === 0 ? '' : 'has-error');
    }

    render() {
        return (
            <div className={'contact-card'}>
                <form onSubmit={this.handleSubmit}>
                    <FormTitle>Nieuw contact aanmaken</FormTitle>
                    <Card horizontal>
                        <CardContent>
                            <div className={`${this.errorClass(this.state.formErrors.name)}`}>
                                <Label htmlFor="name" label="Naam:" />
                                <Input name="name" placeholder="Naam van het contact..." onChange={this.handleUserInput} value={this.state.name} required />
                            </div>
                            <div className={`${this.errorClass(this.state.formErrors.phone)}`}>
                                <Label htmlFor="phone" label="Telefoonnummer:" />
                                <Input placeholder="Telefoonnummer..." name="phone" onChange={this.handleUserInput} value={this.state.phone} />
                            </div>
                            <div className={`${this.errorClass(this.state.formErrors.email)}`}>
                                <Label htmlFor="email" label="Emailadres (optioneel):" />
                                <Input placeholder="Email..." name="email" onChange={this.handleUserInput} value={this.state.email} />
                            </div>
                            <p />
                            <FormErrors formErrors={this.state.formErrors} />
                            <Button variant="secondary" disabled={!this.state.formValid} taskflow>Aanmaken</Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        )
    }
}