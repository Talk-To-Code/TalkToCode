package ast;

import java.util.ArrayList;

/**
 * @author GAO RISHENG This class is mainly for syntax generation of class
 *         declaration in Python Programming Language
 */
public class ASTClassP extends ASTClass {
	private ArrayList<ASTExpressionUnitIdentifier> inheritClass;

	public ASTClassP(String name) {
		super(name);
		this.inheritClass = new ArrayList<ASTExpressionUnitIdentifier>();
	}
	
	public void addInheritance(ASTExpressionUnitIdentifier inheritClass){
		this.inheritClass.add(inheritClass);
		inheritClass.addParent(this);
	}

	// Syntax generation
	public String toSyntax() {
		this.result = "class ";
		this.result += this.name.toSyntax();
		this.result += "(";
		int index = 0;
		for (ASTExpressionUnitIdentifier parent : this.inheritClass) {
			this.result += parent.toSyntax();
			if(index < this.inheritClass.size()-1) this.result += ", ";
			index++;
		}
		this.result += "):\n";
		for (ASTStatement s : this.statements) {
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "\t";
			this.result += s.toSyntax();
			if(s instanceof ASTSimpleStatement || s instanceof ASTComment) this.result += "\n";
		}
		return this.result;
	}
}
