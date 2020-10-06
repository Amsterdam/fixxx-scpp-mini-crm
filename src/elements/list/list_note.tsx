import { SearchBar } from '@amsterdam/asc-ui'
import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'
import { Contact } from '../../shared/service_contact'
import NoteService, { Note } from '../../shared/service_note'
import { School } from '../../shared/service_school'
import { extractHashtagsWithIndices } from '../../utils'
import './list.scss'

type NoteListProps = {
    hideSearch?: boolean
    contact?: Contact
    school?: School
}

type NoteListState = {
    notes: Note[]
    filteredNotes: Note[]
}

export class NoteList extends React.Component<NoteListProps> {
    filter = ""
    noteService: NoteService
    readonly state: NoteListState = {
        notes: [],
        filteredNotes: []
    }

    constructor(props: NoteListProps) {
        super(props)
        this.noteService = new NoteService()
        
        if(this.props.contact){
            // Retrieve notes for a contact?
            console.log("retrieve notes for " + this.props.contact.name)
            this.retrieveNotes(this.props.contact.name)
        } else if(this.props.school){
            // Retrieve notes for a school?
            this.retrieveNotes(this.props.school.name)
        } else {
            // Retrieve all notes?
            this.retrieveNotes("")
        }
        
    }
    retrieveNotes = (filter: string) => {
        this.filter = filter.toLowerCase()
        this.noteService.retrieveNotes().then((notes: Note[]) => {
            this.setState({
                notes: notes.filter((note: Note) => {
                    return note.note.toLowerCase().indexOf(this.filter) !== -1
                }),
                filteredNotes: notes
            })
        })

    }
    handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.retrieveNotes(e.target.value)
    }

    colorNote = (note: Note) => {
        var i = 0
        let _raw = note.note
        _raw.replace('  ', ' ').replace(' .', '.')
        const _detectedTags = extractHashtagsWithIndices(_raw).map((hashtag: any) => {
            return hashtag.hashtag
        })
        // Replace the hashtags
        for (var tag of _detectedTags) {
            _raw = _raw.replace('#' + tag, "[" + tag + "]")
        }

        if (note.contacts) {
            for (var contact of note.contacts) {
                let _contact = (contact as Contact)
                _raw = _raw.replace(_contact.name, "[" + _contact.name + "]")
            }
        }
        if (note.schools) {
            for (var school of note.schools) {
                let _school = (school as School)
                _raw = _raw.replace(_school.name, "[" + _school.name + "]")
            }
        }

        const _textArray = _raw.split(/[\][{}]/)

        const coloredText = _textArray.map(_t => {
            // Is it a tag?
            if (_detectedTags.indexOf(_t) > -1) {
                return <span key={`tag_${i++}`} className="tag">{_t}</span>;
            }

            // Is it a school?
            if (note.schools) {
                const isSchool: School | undefined = (note.schools as School[]).find((s: School) => s.name === _t)
                if (isSchool) {
                    return <Link key={`school_${isSchool.id}`} className="school" to={{
                        pathname: "/school/" + isSchool.id,
                        state: {
                            contact: isSchool
                        }
                    }}>{_t}</Link>
                }
            }

            // Is it a contact?
            if (note.contacts) {
                const isContact: Contact | undefined = (note.contacts as Contact[]).find((c: Contact) => c.name === _t)
                if (isContact) {
                    return <Link key={`contact_${isContact.id}`} className="contact" to={{
                        pathname: "/contact/" + isContact.id,
                        state: {
                            contact: isContact
                        }
                    }}>{_t}</Link>
                }
            }

            // No, it is plain text
            return _t
        })
        return <div>{coloredText}</div>
    }
    
    displayDateTime = (text: string | undefined) => {
        if (text) {
            const start = moment(text).format("DD-MM-YYYY hh:mm")
            return <div key={start} className="note-start">{start}</div>
        }
        return ""
    }
    displayContactName = (text: string | undefined) => {
        if (text) {
            return <div key={text} className="note-contact">{text}</div>
        }
        return ""
    }
    render() {
        return <>
            {!this.props.hideSearch && 
            <SearchBar placeholder="Notities filteren..." onChange={(e) => {
                this.handleSearchInput(e)
            }} />
            }
            <div className={'note-list'}>
                {this.state.notes && this.state.notes.map((note: Note) => (
                    <div key={`note_${note.start}`}>
                        {this.displayDateTime(note.start)}
                        {this.displayContactName(note.contact?.name)}
                        {this.colorNote(note)}
                    </div>
                ))}
            </div>
        </>
    }
}