package ast;

import java.util.ArrayList;

/**
 * @author GAO RISHENG A0101891L
 * This class is in charge of syntax generation of while statement in Python programs
 * 
 */
public class ASTWhileStatementP extends ASTWhileStatement {
	private ArrayList<ASTStatement> elseBranch;

	public ASTWhileStatementP(ASTExpression exp) {
		super(exp);
		this.elseBranch = new ArrayList<ASTStatement>();
	}
	public void addElseBranch(ASTStatement s){
		this.elseBranch.add(s);
		s.addParent(this);
	}
	//code generation
	//while(conditon):\n \tstatements\n
	public String toSyntax(){
		this.result = "while (";
		this.result +=this.condition.toSyntax();
		this.result+= "):\n";
		for(int i =0;i<this.statements.size();i++){
			for(int j = 0; j < this.indent; j++) this.result+="\t";
			this.result+="\t";
			this.result+=this.statements.get(i).toSyntax();
			this.result+="\n";
		}
		if(!this.elseBranch.isEmpty()){
			for(int i = 0; i < this.indent; i++) this.result+="\t";
			this.result+="else:\n";
			for(int i = 0;i<this.elseBranch.size();i++){
				for(int j = 0; j < this.indent; j++) this.result+="\t";
				this.result += "\t";
				this.result += this.elseBranch.get(i).toSyntax();
				this.result += "\n";
			}
		}
		this.result+="\n";
		return this.result;
	}
}
