class Teacher {
    constructor(id, firstName, lastName, age, displayName, userName ) {
            this.id = id;
            this.userName = userName
            this.firstName = firstName;
            this.lastName = lastName;
            this.age = age;
            this.displayName = displayName
            this.role = "TEACHER"
    }
}

module.exports = Teacher;