package ast;

import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of generation of syntax that represents a for loop in 
 * python programs
 *
 */
public class ASTForStatementP extends ASTForStatement {
	private ArrayList<ASTStatement> elseBranch;
	private ArrayList<ASTExpressionUnitIdentifier> variable;
	private ASTExpressionUnit exp;
	public ASTForStatementP() {
		super();
		this.statements = new ArrayList<ASTStatement>();
		this.elseBranch = new ArrayList<ASTStatement>();
		this.variable = new ArrayList<ASTExpressionUnitIdentifier>();
	}
	public void addVariable(ASTExpressionUnitIdentifier variable){
		this.variable.add(variable);
		variable.addParent(this);
	}
	public void addExp(ASTExpressionUnit exp){
		this.exp = exp;
		exp.addParent(this);
	}
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	public void addElseBranch(ASTStatement s){
		this.elseBranch.add(s);
		s.addParent(this);
	}
	//actual code generation
	public String toSyntax(){
		this.result = "for ";
		for(int i = 0; i < this.variable.size()-1; i++) {
			this.result += this.variable.get(i).toSyntax();
			this.result += ", ";
		}
		this.result+=this.variable.get(this.variable.size()-1).toSyntax();
		this.result += " in ";
		this.result += this.exp.toSyntax() +":\n";
		for(int i = 0;i<this.statements.size();i++){
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result += "\t";
			this.result += this.statements.get(i).toSyntax();
			if(this.statements.get(i) instanceof ASTSimpleStatement || this.statements.get(i) instanceof ASTComment) this.result += "\n";
		}
		if(!this.elseBranch.isEmpty()){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result+="else:\n";
			for(int i = 0;i<this.elseBranch.size();i++){
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += this.elseBranch.get(i).toSyntax();
				if(this.elseBranch.get(i) instanceof ASTSimpleStatement || this.elseBranch.get(i) instanceof ASTComment) this.result += "\n";
			}
		}
		return this.result;
	}
}
