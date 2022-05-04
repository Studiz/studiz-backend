class Student {
    constructor(id, firstName, lastName, age, displayName, userName ) {
            this.id = id;
            this.userName = userName
            this.firstName = firstName;
            this.lastName = lastName;
            this.age = age;
            this.displayName = displayName
            this.role = "STUDENT"
    }
}

module.exports = Student;